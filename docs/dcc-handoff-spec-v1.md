# DCC Handoff Spec v1

## 1. Purpose

Standard contract for all DCC-origin handoffs into WTA-like satellite sites so routing, attribution, observability, and recovery are consistent across nodes.

## 2. Versioning

- `source` MUST be `"dcc"`
- `version` MUST be `"1"`
- Future breaking changes require `version: "2"` (no silent behavior change in v1)

## 3. Transport

### Endpoint

- `GET /handoff/dcc`

### Query Params

- `payload` (required): base64url-encoded UTF-8 JSON
- `sig` (optional/required by env): hex HMAC-SHA256 of raw payload

### Signature Rule

- If `DCC_WTA_HANDOFF_SECRET` (or `WTA_HANDOFF_SECRET`) is configured on receiver:
  - `sig` is REQUIRED
  - invalid/missing `sig` => reject
- If secret is not configured:
  - unsigned payloads may be accepted (dev/back-compat mode)

## 4. Payload Schema (v1)

```json
{
  "source": "dcc",
  "version": "1",
  "handoffId": "string-required",
  "destination": {
    "regionSlug": "string-optional",
    "citySlug": "string-optional",
    "portSlug": "string-optional"
  },
  "traveler": {
    "adults": 2,
    "children": 1,
    "partySize": 3,
    "cruiseDate": "YYYY-MM-DD",
    "cruiseShip": "string-optional",
    "cruiseShipSlug": "string-optional"
  },
  "intent": {
    "category": "string-optional",
    "itemSlug": "string-optional",
    "date": "YYYY-MM-DD",
    "timeOfDay": "morning|afternoon|evening",
    "budgetTier": "value|standard|premium"
  },
  "context": {
    "referrerPath": "string-optional",
    "authorityTopic": "string-optional",
    "campaign": "string-optional",
    "nodeSlug": "string-optional"
  }
}
```

### Required

- `source`, `version`, `handoffId`

### Normalization

- slugs lowercased/trimmed
- dates must match `^\d{4}-\d{2}-\d{2}$`
- positive ints only for counts
- if `partySize` missing, receiver may derive `adults + children`

## 5. Resolution Priority (Routing)

1. `intent.itemSlug` exact mapped product -> `/tours/[company]/[item]`
2. `destination.portSlug` (+ optional category) -> `/ports/[slug]`
3. `intent.category` only -> `/tours?category=...`
4. fallback -> `/tours`

## 6. Query Mapping Contract

Receiver should preserve attribution and traveler context in redirect query:

- `source=dcc`
- `handoff_id=<handoffId>`
- `date`, `partySize`, `adults`, `children`
- `cruiseShip`, `cruiseShipSlug`
- `category`, `timeOfDay`, `budgetTier`
- `referrer_path`, `authority_topic`, `campaign`, `node_slug`

## 7. Cookie Contract

On successful handoff response, set:

- `wta_handoff_source=dcc`
- `wta_handoff_id=<handoffId>`
- optional `wta_authority_topic=<authorityTopic>`
- `SameSite=Lax`, `path=/`, `max-age=7d`

## 8. Persistence Contract

Store each received handoff (KV/Redis):

- key: `handoff:received:<handoffId>`
- index: `handoff:received:recent` (max ~300)
- fields: `handoffId`, `source`, `version`, `targetUrl`, `intent`, `receivedAt`, `ip`, `userAgent`, `reason`
- TTL: 30 days

## 9. Error Contract

- `400` invalid/missing payload/signature/source/version
- `401/403` debug endpoint unauthenticated
- `302/307` successful redirect
- body shape on error:

```json
{ "success": false, "error": "<message>", "details": "<optional>" }
```

## 10. Debug/Admin Contract

- `GET /api/handoff/dcc/debug?limit=N`
- Auth required
- `200` response:

```json
{ "success": true, "count": 1, "rows": [] }
```

## 11. Conformance Tests (Minimum)

1. Missing payload -> `400`
2. Invalid base64/json -> `400`
3. Bad source/version -> `400`
4. Valid payload -> `302/307`
5. Redirect route class matches expected (item/port/category/fallback)
6. Cookies set correctly
7. Debug unauth -> `401/403`
8. Debug auth -> `200` and row contains `handoffId`
9. Mapping fidelity for port, date, partySize, category
10. Optional checkout test: attribution fields persist into order/receipt
