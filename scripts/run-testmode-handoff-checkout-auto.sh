#!/usr/bin/env bash
set -euo pipefail

# Auto-discover variant:
# - finds first tour with an available slot + rate
# - creates DCC-attributed checkout intent
# - confirms PI in Stripe test mode (pm_card_visa)
# - polls receipt
# - validates section 8 attribution fields
# - validates debug ingestion (auth)
#
# Usage:
#   TEST_DOMAIN="https://your-test-domain.vercel.app" \
#   STRIPE_SECRET_KEY="sk_test_..." \
#   ADMIN_PASSWORD="..." \  # optional if WTA_ADMIN_SECRET is set
#   WTA_ADMIN_SECRET="..." \
#   ./scripts/run-testmode-handoff-checkout-auto.sh

: "${TEST_DOMAIN:?Set TEST_DOMAIN, e.g. https://your-test-domain.vercel.app}"
: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY=sk_test_...}"
ADMIN_SECRET="${ADMIN_PASSWORD:-${WTA_ADMIN_SECRET:-}}"

CONTACT_NAME="${CONTACT_NAME:-QA Stripe Test}"
CONTACT_EMAIL="${CONTACT_EMAIL:-qa+stripe-test@example.com}"
CONTACT_PHONE="${CONTACT_PHONE:-5551234567}"

UTC_NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
HID="stripe_dcc_$(date -u +%Y%m%dT%H%M%SZ)"

echo "== Preflight =="
echo "UTC: $UTC_NOW"
echo "Domain: $TEST_DOMAIN"
echo "Handoff ID: $HID"

if [ -z "${ADMIN_SECRET}" ]; then
  echo "WARN: ADMIN_PASSWORD and WTA_ADMIN_SECRET are both empty. Admin debug check will be skipped."
fi

if [ -n "${STRIPE_WEBHOOK_SECRET:-}" ] && [[ ! "${STRIPE_WEBHOOK_SECRET}" =~ ^whsec_ ]]; then
  echo "WARN: STRIPE_WEBHOOK_SECRET does not look like a Stripe webhook signing secret (expected prefix: whsec_)."
fi

echo "== Stripe key sanity check =="
if [[ "${STRIPE_SECRET_KEY}" == *"..."* ]] || [[ "${STRIPE_SECRET_KEY}" == *"Your"* ]]; then
  echo "FAIL: STRIPE_SECRET_KEY looks like placeholder text. Use the real sk_test_... value."
  exit 2
fi

stripe_account="$(curl -sS -u "$STRIPE_SECRET_KEY:" https://api.stripe.com/v1/account)"
stripe_error="$(echo "$stripe_account" | jq -r '.error.message // empty')"
if [ -n "$stripe_error" ]; then
  echo "FAIL: Stripe auth failed: $stripe_error"
  echo "Tip: export STRIPE_SECRET_KEY='sk_test_REAL_KEY' (no quotes inside, no ellipsis)."
  exit 2
fi

stripe_livemode="$(echo "$stripe_account" | jq -r '.livemode // "unknown"')"
if [ "$stripe_livemode" != "false" ]; then
  echo "FAIL: STRIPE_SECRET_KEY is not test mode (livemode=$stripe_livemode)."
  exit 2
fi
echo "Stripe auth OK (test mode)."

echo "== Smoke checks =="
code1="$(curl -sS -o /tmp/handoff_no_payload.out -w "%{http_code}" "$TEST_DOMAIN/handoff/dcc")"
code2="$(curl -sS -o /tmp/handoff_debug_unauth.out -w "%{http_code}" "$TEST_DOMAIN/api/handoff/dcc/debug?limit=1")"
echo "/handoff/dcc -> $code1 (expect 400)"
echo "/api/handoff/dcc/debug?limit=1 unauth -> $code2 (expect 401/403)"

echo "== Discover valid tour availability/rate =="
start="$(date -u +%F)"
end="$(date -u -d '+120 days' +%F)"

tours_json="$(curl -sS "$TEST_DOMAIN/api/tours/list")"
tour_count="$(echo "$tours_json" | jq -r '.count // 0')"
if [ "$tour_count" = "0" ]; then
  echo "FAIL: /api/tours/list returned no tours"
  exit 1
fi

found=0
COMPANY=""
ITEM_PK=""
AVAILABILITY_PK=""
RATE_PK=""
START_AT=""
TITLE=""

# sample first 100 tours (slice in jq to avoid pipefail+head broken-pipe aborts)
for row in $(echo "$tours_json" | jq -r '.tours[:100][] | @base64'); do
  _jq(){ echo "$row" | base64 -d | jq -r "$1"; }

  COMPANY="$(_jq '.company')"
  ITEM_PK="$(_jq '.pk')"
  TITLE="$(_jq '.title')"

  av_json="$(curl -sS "$TEST_DOMAIN/api/fareharbor/availabilities?company=$COMPANY&item=$ITEM_PK&start=$start&end=$end")"
  AVAILABILITY_PK="$(echo "$av_json" | jq -r '.availabilities[0].pk // .availabilities[0].availability_pk // empty')"
  RATE_PK="$(echo "$av_json" | jq -r '.availabilities[0].customer_type_rates[0].pk // empty')"
  START_AT="$(echo "$av_json" | jq -r '.availabilities[0].start_at // .availabilities[0].startAt // empty')"

  if [ -n "$AVAILABILITY_PK" ] && [ -n "$RATE_PK" ]; then
    found=1
    break
  fi
done

if [ "$found" -ne 1 ]; then
  echo "FAIL: Could not find a valid company/item/availability/rate in sampled tours"
  exit 1
fi

echo "Selected:"
echo "  company=$COMPANY"
echo "  itemPk=$ITEM_PK"
echo "  availabilityPk=$AVAILABILITY_PK"
echo "  ratePk=$RATE_PK"
echo "  startAt=$START_AT"
echo "  title=$TITLE"

echo "== Create checkout intent with DCC attribution =="
create_payload="$(cat <<JSON
{
  "contact": {
    "name": "$CONTACT_NAME",
    "email": "$CONTACT_EMAIL",
    "phone": "$CONTACT_PHONE"
  },
  "items": [
    {
      "company": "$COMPANY",
      "itemPk": $ITEM_PK,
      "availabilityPk": $AVAILABILITY_PK,
      "ratePk": $RATE_PK,
      "qty": 1,
      "title": "$TITLE",
      "startAt": "$START_AT",
      "handoffSource": "dcc",
      "handoffId": "$HID",
      "authorityTopic": "alaska-cruise",
      "referrerPath": "/authority/juneau",
      "portSlug": "juneau",
      "handoffCategory": "whale-watching",
      "handoffDate": "2026-07-12",
      "partySize": 2,
      "adults": 2,
      "children": 0,
      "cruiseShip": "Norwegian Bliss",
      "cruiseShipSlug": "norwegian-bliss",
      "timeOfDay": "morning",
      "budgetTier": "standard"
    }
  ]
}
JSON
)"

create="$(curl -sS -X POST "$TEST_DOMAIN/api/stripe/create-intent" \
  -H "Content-Type: application/json" \
  -d "$create_payload")"

ok="$(echo "$create" | jq -r '.success // false')"
if [ "$ok" != "true" ]; then
  echo "create-intent failed:"
  echo "$create" | jq '.'
  exit 1
fi

PI="$(echo "$create" | jq -r '.payment_intent_id')"
ORDER_ID="$(echo "$create" | jq -r '.order_id')"
echo "order_id=$ORDER_ID"
echo "payment_intent_id=$PI"

echo "== Confirm PaymentIntent in Stripe test mode =="
confirm="$(curl -sS -u "$STRIPE_SECRET_KEY:" \
  -X POST "https://api.stripe.com/v1/payment_intents/$PI/confirm" \
  -d payment_method=pm_card_visa)"

pi_status="$(echo "$confirm" | jq -r '.status // "unknown"')"
livemode="$(echo "$confirm" | jq -r '.livemode // "unknown"')"
echo "stripe_pi_status=$pi_status"
echo "stripe_livemode=$livemode (expect false)"

if [ "$livemode" != "false" ]; then
  echo "FAIL: Stripe key is not test mode (livemode != false)"
  exit 2
fi

echo "== Poll receipt for webhook processing =="
receipt=""
rstatus="pending"
for i in $(seq 1 24); do
  receipt="$(curl -sS "$TEST_DOMAIN/api/receipt?pi=$PI")"
  rstatus="$(echo "$receipt" | jq -r '.status // "pending"')"
  if [ "$rstatus" != "pending" ] && [ "$rstatus" != "payment_pending" ]; then
    break
  fi
  sleep 5
done

echo "receipt_status=$rstatus"

echo "== Validate Section 8 fields =="
missing=0
for k in handoffSource handoffId authorityTopic portSlug category date partySize cruiseShip cruiseShipSlug; do
  v="$(echo "$receipt" | jq -r ".attribution.$k // empty")"
  if [ -z "$v" ] || [ "$v" = "null" ]; then
    echo "MISSING:$k"
    missing=1
  else
    echo "OK:$k=$v"
  fi
done

echo "== Validate handoff debug ingestion (auth) =="
admin_skipped=0
found_debug=0
if [ -z "${ADMIN_SECRET}" ]; then
  admin_skipped=1
  echo "SKIP: admin debug check (no admin secret provided)."
else
  cookie_jar="$(mktemp)"
  trap 'rm -f "$cookie_jar"' EXIT

  login_code="$(curl -sS -c "$cookie_jar" -o /tmp/admin_login.out -w "%{http_code}" \
    -X POST "$TEST_DOMAIN/api/admin/login" \
    -H "content-type: application/json" \
    -d "{\"password\":\"$ADMIN_SECRET\"}")"
  echo "admin_login_status=$login_code"

  debug_code="$(curl -sS -b "$cookie_jar" -o /tmp/handoff_debug_auth.out -w "%{http_code}" \
    "$TEST_DOMAIN/api/handoff/dcc/debug?limit=50")"
  echo "debug_auth_status=$debug_code"

  found_debug="$(jq --arg hid "$HID" '[.rows[]? | select(.handoffId==$hid)] | length' /tmp/handoff_debug_auth.out)"
  echo "debug_row_found=$found_debug"
fi

echo "== Summary =="
echo "handoff_id=$HID"
echo "order_id=$ORDER_ID"
echo "payment_intent_id=$PI"
echo "receipt_status=$rstatus"

if [ "$missing" -ne 0 ]; then
  echo "RESULT: FAIL (section 8 attribution fields missing)"
  exit 3
fi

if [ "$admin_skipped" -eq 0 ] && [ "$found_debug" -lt 1 ]; then
  echo "RESULT: FAIL (handoff debug row not found)"
  exit 4
fi

echo "RESULT: PASS (test-mode payment + webhook + attribution + debug ingestion)"
