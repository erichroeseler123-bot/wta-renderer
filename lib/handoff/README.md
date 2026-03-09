# DCC -> WTA Handoff Helpers

Use these from DCC to generate links into WTA's intake endpoint: `/handoff/dcc`.

## Signed payload mode (recommended)

```ts
import { buildWtaHandoffUrlFromIntent } from "./dcc-sender";

const url = buildWtaHandoffUrlFromIntent({
  wtaOrigin: "https://welcometoalaskatours.com",
  secret: process.env.DCC_WTA_HANDOFF_SECRET!,
  intent: {
    source: "dcc",
    version: "1",
    handoffId: "ho_123",
    destination: { portSlug: "juneau" },
    traveler: { partySize: 4, cruiseDate: "2026-07-12" },
    bookingIntent: { category: "whale-watching" },
    context: {
      referrerPath: "/guides/juneau-whale-watching",
      campaign: "dcc",
      authorityTopic: "best-juneau-whale-watch",
    },
  },
});
```

## ID mode

Store the full intent in KV as `handoff:dcc:{id}`, then send only:

```ts
import { buildWtaHandoffUrlFromId } from "./dcc-sender";

const url = buildWtaHandoffUrlFromId({
  wtaOrigin: "https://welcometoalaskatours.com",
  handoffId: "ho_123",
});
```

## WTA debug endpoint (admin-only)

After logging into WTA admin, inspect recent received handoffs:

`GET /api/handoff/dcc/debug?limit=25`
