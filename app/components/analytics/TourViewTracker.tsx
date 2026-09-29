"use client";

import { useEffect } from "react";
import { trackTourView } from "@/lib/analytics/ga";

export default function TourViewTracker({
  tour,
}: {
  tour: {
    company: string;
    itemPk: number | string;
    title: string;
    category?: string;
    fromPrice?: string;
    port?: string;
  };
}) {
  useEffect(() => {
    trackTourView(tour);
  }, [tour.company, tour.itemPk, tour.title, tour.category, tour.fromPrice, tour.port]);

  return null;
}
