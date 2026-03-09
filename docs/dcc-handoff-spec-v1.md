# DCC Handoff Spec v1

## 1. Purpose
Define a stable, reusable contract for DCC-origin handoffs into WTA-style receiver sites so routing, attribution, and observability behave consistently across nodes.

## 2. Versioning
- `source` MUST be `"dcc"`.
- `version` MUST be `"1"`.
- Breaking changes require a new major payload version (for example `"2"`).

## 3. Transport
### 3.1 Endpoint
- Receiver endpoint: `GET /handoff/dcc`

### 3.2 Query params
- `payload` (required): base64url-encoded UTF-8 JSON payload.
- `sig` (conditionally required): signature over raw `payload` string.

### 3.3 Signature
When receiver secret is configured (`DCC_WTA_HANDOFF_SECRET` or `WTA_HANDOFF_SECRET`):
- `sig` is REQUIRED.
- Signature algorithm is fixed:

```text
sig = base64url(HMAC-SHA256(payload, secret))
```

- Missing or invalid signature MUST be rejected.

When no secret is configured, unsigned payloads MAY be accepted (development/back-compat mode only).

## 4. Payload Schema (v1)

```json
{
  "source": "dcc",
  "version": "1",
  "handoffId": "string-required",
  "createdAt": "ISO-8601 timestamp, recommended",
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

### 4.1 Required fields
- `source`, `version`, `handoffId`

### 4.2 Normalization rules
- Slug-like strings should be trimmed and normalized to lowercase.
- Date values must match `YYYY-MM-DD`.
- Traveler counts must be positive integers.
- If `partySize` is omitted, receiver MAY derive it from `adults + children`.

## 5. Resolution Priority
Receiver resolves the final route in this order:
1. Exact `intent.itemSlug` mapping -> `/tours/[company]/[item]`
2. `destination.portSlug` (optionally with category filter) -> `/ports/[slug]`
3. Category-only intent -> `/tours?category=...`
4. Fallback -> `/tours`

The receiver owns final commercial mapping. DCC MUST NOT send transactional identifiers (provider PKs, cart IDs, payment IDs, booking IDs).

## 6. Query Mapping Contract
On successful redirect, receiver should preserve attribution/traveler context in query params where available:
- `source=dcc`
- `handoff_id=<handoffId>`
- `date`, `partySize`, `adults`, `children`
- `cruiseShip`, `cruiseShipSlug`
- `category`, `timeOfDay`, `budgetTier`
- `referrer_path`, `authority_topic`, `campaign`, `node_slug`

## 7. Cookie Contract
On successful handoff, receiver sets:
- `wta_handoff_source=dcc`
- `wta_handoff_id=<handoffId>`
- optional `wta_authority_topic=<authorityTopic>`

Recommended attributes: `Path=/`, `SameSite=Lax`, max age 7 days.

## 8. Persistence Contract
Receiver should persist received handoffs in storage (KV/Redis) when available:
- row key: `handoff:received:<handoffId>`
- recent index key: `handoff:received:recent`
- index size cap: ~300
- TTL: 30 days

Stored row should include at least:
- `handoffId`, `source`, `version`, `sourceMode`
- `targetUrl`, `reason`
- `payload` (full normalized handoff payload, not just `intent`)
- `receivedAt`, `ip`, `userAgent`

## 9. Error Contract
- `400`: invalid payload, decode/JSON failure, invalid source/version, missing required fields.
- `403`: missing/invalid signature when signature is required.
- `302` or `307`: successful redirect.

Error body format:

```json
{
  "success": false,
  "error": "string",
  "details": "optional"
}
```

## 10. Debug/Admin Contract
- Endpoint: `GET /api/handoff/dcc/debug?limit=N`
- Auth required.
- Unauthenticated response should be `401` or `403`.
- Authenticated response:

```json
{
  "success": true,
  "count": 1,
  "rows": []
}
```

## 11. Conformance Tests (Minimum)
1. Missing payload -> `400`
2. Invalid base64/json -> `400`
3. Bad source/version -> `400`
4. Signature required + missing/invalid sig -> `403`
5. Valid payload -> redirect (`302`/`307`)
6. Redirect route class matches expected (`ports`, `tours`, `tour_item`)
7. Handoff cookies are set
8. Debug unauth -> `401`/`403`
9. Debug auth -> `200` and row contains `handoffId`
10. Mapping fidelity check (`port`, `date`, `partySize`, `category`)
11. Optional checkout attribution persistence test

## 12. Receiver Responsibilities
- Verify signature when configured.
- Normalize payload fields.
- Resolve route using local mapping rules.
- Persist debug record when storage is available.
- Set handoff cookies on success.
- Preserve attribution fields into downstream cart/order flows where applicable.

## 13. Non-Goals
This spec does not transport:
- payment identifiers
- booking confirmations
- provider-specific inventory PKs
- cart state
- checkout session state
