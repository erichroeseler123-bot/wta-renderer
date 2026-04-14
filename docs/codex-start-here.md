# Codex Start Here

## What This Repo Is

`wta-renderer` is the WTA-facing rendering repo.
It is a downstream Alaska surface, not the DCC decision layer and not the booking vault.

## Role In The System

- role: `renderer`
- network position: `DCC -> WTA-facing renderer -> downstream booking or affiliate flow`
- this repo should render and continue the Alaska/WTA experience cleanly
- it should not redefine DCC doctrine locally

## Booking Impact

- likely `yes`, because this repo contains booking-adjacent runtime and callback code
- mark payment, webhook, confirmation, callback, and booking-state files before cleanup

## Do Not Touch Until Classified

- payment routes
- webhook routes
- booking confirmation pages
- token-based booking retrieval
- order ledgers
- middleware protecting customer or internal booking access
- DCC handoff or callback payload contracts

## Read These Next

1. `README.md`
2. `package.json`
3. any checkout, payment, or webhook routes
4. any embed or handoff entrypoints from DCC
5. main rendering entrypoints under `app/`

## Practical Rule

If a change affects money, order state, booking retrieval, or fulfillment continuity, it is not simple cleanup.
