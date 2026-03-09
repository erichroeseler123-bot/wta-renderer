#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   TEST_DOMAIN="https://your-test-domain.vercel.app" \
#   STRIPE_SECRET_KEY="sk_test_..." \
#   ADMIN_PASSWORD="..." \
#   ./scripts/run-testmode-handoff-checkout.sh
#
# Optional overrides:
#   COMPANY, ITEM_PK, AVAILABILITY_PK, RATE_PK
#   CONTACT_NAME, CONTACT_EMAIL, CONTACT_PHONE
#   HIDE_BOOKING_FIELDS=1  # if you only want attribution test

: "${TEST_DOMAIN:?Set TEST_DOMAIN, e.g. https://your-test-domain.vercel.app}"
: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY=sk_test_...}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD for /api/admin/login}"

COMPANY="${COMPANY:-beyondak}"
ITEM_PK="${ITEM_PK:-195602}"
AVAILABILITY_PK="${AVAILABILITY_PK:-1838573325}"
RATE_PK="${RATE_PK:-7723157775}"

CONTACT_NAME="${CONTACT_NAME:-QA Stripe Test}"
CONTACT_EMAIL="${CONTACT_EMAIL:-qa+stripe-test@example.com}"
CONTACT_PHONE="${CONTACT_PHONE:-5551234567}"

UTC_NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
HID="stripe_dcc_$(date -u +%Y%m%dT%H%M%SZ)"

echo "== Preflight =="
echo "UTC: $UTC_NOW"
echo "Domain: $TEST_DOMAIN"
echo "Handoff ID: $HID"

echo "== Smoke checks =="
code1="$(curl -sS -o /tmp/handoff_no_payload.out -w "%{http_code}" "$TEST_DOMAIN/handoff/dcc")"
code2="$(curl -sS -o /tmp/handoff_debug_unauth.out -w "%{http_code}" "$TEST_DOMAIN/api/handoff/dcc/debug?limit=1")"
echo "/handoff/dcc -> $code1 (expect 400)"
echo "/api/handoff/dcc/debug?limit=1 unauth -> $code2 (expect 401/403)"

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
      "title": "QA Test Item",
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
cookie_jar="$(mktemp)"
trap 'rm -f "$cookie_jar"' EXIT

login_code="$(curl -sS -c "$cookie_jar" -o /tmp/admin_login.out -w "%{http_code}" \
  -X POST "$TEST_DOMAIN/api/admin/login" \
  -H "content-type: application/json" \
  -d "{\"password\":\"$ADMIN_PASSWORD\"}")"
echo "admin_login_status=$login_code"

debug_code="$(curl -sS -b "$cookie_jar" -o /tmp/handoff_debug_auth.out -w "%{http_code}" \
  "$TEST_DOMAIN/api/handoff/dcc/debug?limit=50")"
echo "debug_auth_status=$debug_code"

found="$(jq --arg hid "$HID" '[.rows[]? | select(.handoffId==$hid)] | length' /tmp/handoff_debug_auth.out)"
echo "debug_row_found=$found"

echo "== Summary =="
echo "handoff_id=$HID"
echo "order_id=$ORDER_ID"
echo "payment_intent_id=$PI"
echo "receipt_status=$rstatus"

if [ "$missing" -ne 0 ]; then
  echo "RESULT: FAIL (section 8 attribution fields missing)"
  exit 3
fi

if [ "$found" -lt 1 ]; then
  echo "RESULT: FAIL (handoff debug row not found)"
  exit 4
fi

echo "RESULT: PASS (test-mode payment + webhook + attribution + debug ingestion)"
