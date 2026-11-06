import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";

import { GET as getItems } from "../app/api/fareharbor/items/route";
import { GET as getCalendar } from "../app/api/fareharbor/calendar/route";
import { GET as getDemoAvailability } from "../app/api/fareharbor/availability/route";
import { POST as rebook } from "../app/api/fareharbor/rebook/route";

const APP_KEY = "00000000-0000-4000-8000-000000000001";
const USER_KEY = "00000000-0000-4000-8000-000000000002";

function setTestCredentials(t: TestContext) {
  const credentials = { FAREHARBOR_APP_KEY: APP_KEY, FAREHARBOR_USER_KEY: USER_KEY };
  const original = Object.fromEntries(Object.keys(credentials).map((key) => [key, process.env[key]]));
  Object.assign(process.env, credentials);
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("FareHarbor items use header authentication and keep public responses safe", async (t) => {
  setTestCredentials(t);

  const cases = [
    { name: "provider 404", status: 200, upstream: () => new Response(USER_KEY, { status: 404 }) },
    { name: "malformed JSON", status: 200, upstream: () => new Response(USER_KEY) },
    {
      name: "network failure",
      status: 500,
      upstream: () => { throw new Error(`Request failed: ${USER_KEY}`); },
    },
    {
      name: "credential reflected in valid JSON",
      status: 502,
      upstream: () => Response.json({ items: [{ pk: 7, name: USER_KEY }] }),
    },
    {
      name: "valid catalog response",
      status: 200,
      upstream: () => Response.json({ items: [{ pk: 7, name: "Boat Tour" }] }),
    },
  ];

  for (const scenario of cases) {
    await t.test(scenario.name, async (subtest) => {
      const fetchItems: typeof fetch = async (input, init) => {
        assert.equal(String(input), "https://fareharbor.com/api/external/v1/companies/x/items/");
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("X-FareHarbor-API-App"), APP_KEY);
        assert.equal(headers.get("X-FareHarbor-API-User"), USER_KEY);
        return scenario.upstream();
      };
      const upstreamFetch = subtest.mock.method(globalThis, "fetch", fetchItems);
      const response = await getItems(new Request("https://wta.example/api/fareharbor/items?company=x&debug=1"));
      assert.equal(upstreamFetch.mock.callCount(), 1);
      assert.equal(response.status, scenario.status);
      assert.match(response.headers.get("cache-control") || "", /no-store/);
      const body = await response.text();
      assert.doesNotMatch(body, /api-(?:user|app)=|fhUrl|bodyPreview|"debug"/i);
      assert.ok(!body.includes(APP_KEY));
      assert.ok(!body.includes(USER_KEY));
      if (scenario.name === "valid catalog response") {
        assert.deepEqual(JSON.parse(body), {
          ok: true,
          count: 1,
          companies: ["x"],
          items: [{ pk: 7, name: "Boat Tour", company: "x" }],
          errorsCount: 0,
          errors: [],
        });
      }
    });
  }
});

test("FareHarbor calendar does not relay an upstream error body or URL", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    ok: false,
    error: `FareHarbor request failed with credential ${USER_KEY}`,
  }));
  const response = await getCalendar(new Request(
    "https://wta.example/api/fareharbor/calendar?company=x&item=7&start=2027-06-01&end=2027-06-01",
  ));
  assert.deepEqual(await response.json(), { ok: false, error: "Upstream availabilities failed" });
});

test("Legacy FareHarbor routes keep credentials and upstream errors private", async (t) => {
  setTestCredentials(t);

  const routes = [
    {
      name: "demo availability",
      error: "Availability fetch failed",
      url: "https://demo.fareharbor.com/api/external/v1/companies/bodyglove/items/7/minimal/availabilities/date/2027-06-01/",
      invoke: () => getDemoAvailability(new Request(
        "https://wta.example/api/fareharbor/availability?itemPk=7&date=2027-06-01",
      )),
    },
    {
      name: "rebook",
      error: "Rebook failed",
      url: "https://fareharbor.com/api/external/v1/bookings/test-booking/rebook/",
      invoke: () => rebook(new Request("https://wta.example/api/fareharbor/rebook", {
        method: "POST",
        body: JSON.stringify({ bookingUuid: "test-booking", newAvailabilityPk: 7 }),
      })),
    },
  ];

  for (const route of routes) {
    await t.test(`${route.name} sanitizes provider responses`, async (subtest) => {
      const fetchResponse: typeof fetch = async (input, init) => {
        assert.equal(String(input), route.url);
        assert.equal(init?.redirect, "error");
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("X-FareHarbor-API-App"), APP_KEY);
        assert.equal(headers.get("X-FareHarbor-API-User"), USER_KEY);
        return Response.json({ id: 7, notes: [APP_KEY, USER_KEY] });
      };
      const fetchProvider = subtest.mock.method(globalThis, "fetch", fetchResponse);

      const success = await route.invoke();
      assert.equal(success.status, 200);
      assert.match(success.headers.get("cache-control") || "", /no-store/);
      assert.deepEqual(await success.json(), { id: 7, notes: ["[REDACTED]", "[REDACTED]"] });

      fetchProvider.mock.mockImplementationOnce(async () => Response.json({
        fhUrl: `${route.url}?api-user=${USER_KEY}`,
        bodyPreview: APP_KEY,
      }, { status: 403 }), 1);
      const rejected = await route.invoke();
      assert.equal(rejected.status, 403);
      assert.deepEqual(await rejected.json(), { error: route.error });

      fetchProvider.mock.mockImplementationOnce(async () => {
        throw new Error(`Provider request failed with ${USER_KEY}`);
      }, 2);
      const failed = await route.invoke();
      assert.equal(failed.status, 500);
      assert.deepEqual(await failed.json(), { error: route.error });
    });
  }
});
