import test from "node:test";
import assert from "node:assert/strict";
import {
  appendWidgetContextToSearchParams,
  parseWidgetInitContext,
} from "@/lib/widgetContext";

test("parseWidgetInitContext captures the widget init contract", () => {
  const params = new URLSearchParams({
    handoffId: "ho_widget_123",
    dcc_return: "https://destinationcommandcenter.com/return",
    source: "dcc",
    sourceSlug: "dcc-cruises-port",
    sourcePage: "/cruises/port/juneau-alaska",
    topicSlug: "shore-excursions",
    portSlug: "juneau",
    productSlug: "juneau-helicopter-glacier-tour",
    eventDate: "2026-07-12",
    embedDomain: "juneauadventuretours.com",
    embedPath: "/helicopter-tours",
    widgetPlacement: "sidebar",
    widgetId: "wta-juneau-1",
  });

  const context = parseWidgetInitContext(params);
  assert.deepEqual(context, {
    handoffId: "ho_widget_123",
    dccReturnUrl: "https://destinationcommandcenter.com/return",
    source: "dcc",
    sourceSlug: "dcc-cruises-port",
    sourcePage: "/cruises/port/juneau-alaska",
    topicSlug: "shore-excursions",
    portSlug: "juneau",
    productSlug: "juneau-helicopter-glacier-tour",
    eventDate: "2026-07-12",
    embedDomain: "juneauadventuretours.com",
    embedPath: "/helicopter-tours",
    widgetPlacement: "sidebar",
    widgetId: "wta-juneau-1",
  });
});

test("appendWidgetContextToSearchParams propagates embed metadata and preserves handoffId", () => {
  const params = appendWidgetContextToSearchParams(
    new URLSearchParams({ source: "dcc" }),
    {
      handoffId: "ho_widget_123",
      dccReturnUrl: "https://destinationcommandcenter.com/return",
      source: "dcc",
      sourceSlug: "dcc-cruises-port",
      sourcePage: "/cruises/port/juneau-alaska",
      topicSlug: "shore-excursions",
      portSlug: "juneau-alaska",
      productSlug: "juneau-helicopter-glacier-tour",
      eventDate: "2026-07-12",
      embedDomain: "juneauadventuretours.com",
      embedPath: "/helicopter-tours",
      widgetPlacement: "sidebar",
      widgetId: "wta-juneau-1",
    },
  );

  assert.equal(params.get("handoffId"), "ho_widget_123");
  assert.equal(params.get("embedDomain"), "juneauadventuretours.com");
  assert.equal(params.get("embedPath"), "/helicopter-tours");
  assert.equal(params.get("productSlug"), "juneau-helicopter-glacier-tour");
});
