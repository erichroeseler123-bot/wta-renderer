"use client";

import { useEffect } from "react";
import { trackCalendarOpen } from "@/lib/analytics/ga";

export default function CalendarOpenTracker({
  tour,
}: {
  tour: {
    company: string;
    itemPk: number | string;
    month?: string;
  };
}) {
  useEffect(() => {
    trackCalendarOpen(tour);
  }, [tour.company, tour.itemPk, tour.month]);

  return null;
}
