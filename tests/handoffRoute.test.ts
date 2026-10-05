import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "@/app/handoff/dcc/route";
import { encodeHandoffPayload, signDccHandoffPayload } from "@/lib/dccHandoff";

test("handoff route signature enforcement", async () => {
  const secret = "test-handoff-secret-123";
  process.env.DCC_WTA_HANDOFF_SIG_SECRET = secret;

  const validObj = {
    source: "dcc",
    version: "1",
    handoffId: "ho_route_test_1",
    destination: { portSlug: "juneau" },
  };
  const payload = encodeHandoffPayload(validObj as any);
  const validSig = signDccHandoffPayload(payload, secret);

  // 1. Valid signature -> 302
  const req1 = new NextRequest(`http://localhost:3000/handoff/dcc?payload=${payload}&sig=${validSig}`);
  const res1 = await GET(req1);
  assert.equal(res1.status, 302);
  assert.ok(res1.headers.get("location")?.includes("/ports/juneau"));

  // 2. Tampered signature -> 400 Invalid handoff signature
  const req2 = new NextRequest(`http://localhost:3000/handoff/dcc?payload=${payload}&sig=tampered_signature`);
  const res2 = await GET(req2);
  assert.equal(res2.status, 400);
  const body2 = await res2.json();
  assert.equal(body2.details, "Invalid handoff signature");

  // 3. Missing signature when secret is configured -> 400 Missing handoff signature
  const req3 = new NextRequest(`http://localhost:3000/handoff/dcc?payload=${payload}`);
  const res3 = await GET(req3);
  assert.equal(res3.status, 400);
  const body3 = await res3.json();
  assert.equal(body3.details, "Missing handoff signature");

  // 4. Missing secret when signature passed -> 400 Missing DCC_WTA_HANDOFF_SIG_SECRET
  delete process.env.DCC_WTA_HANDOFF_SIG_SECRET;
  const req4 = new NextRequest(`http://localhost:3000/handoff/dcc?payload=${payload}&sig=${validSig}`);
  const res4 = await GET(req4);
  assert.equal(res4.status, 400);
  const body4 = await res4.json();
  assert.equal(body4.details, "Missing DCC_WTA_HANDOFF_SIG_SECRET");

  // 5. Unsigned payload when no secret configured -> 302 (spec back-compat mode)
  const req5 = new NextRequest(`http://localhost:3000/handoff/dcc?payload=${payload}`);
  const res5 = await GET(req5);
  assert.equal(res5.status, 302);
});
