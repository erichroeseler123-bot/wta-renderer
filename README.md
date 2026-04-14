# wta-renderer

## What This Repo Is

`wta-renderer` is the WTA-facing renderer and booking-adjacent UI repo for Alaska excursion flows.
It is a downstream surface in the DCC network, not the DCC decision layer and not the Party at Red Rocks booking vault.

## Role In The System

- role: `renderer`
- network position: `DCC -> WTA renderer -> plan / booking continuation`
- this repo should render Alaska-oriented flows clearly and continue the handoff state it receives from DCC
- it should not redefine DCC doctrine locally

## Booking Impact

- booking impact: `yes, potentially runtime-sensitive`
- this repo contains booking-adjacent and checkout-adjacent code
- treat payment, webhook, order, and callback paths as sensitive until explicitly classified

## Read These First

1. `package.json`
2. `app/page.tsx`
3. booking, payment, webhook, and callback routes
4. any DCC handoff or embed entrypoints

## Do Not Touch Until Classified

- payment routes
- webhook routes
- booking confirmation pages
- token-based booking retrieval
- order ledgers
- middleware protecting customer or internal booking access

## Practical Rule

This repo does not own DCC decision logic.
If a change affects money, order state, booking retrieval, or handoff continuity, it is not simple cleanup.
