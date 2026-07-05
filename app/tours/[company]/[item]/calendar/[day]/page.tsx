import {
  getFareHarborAvailabilities,
} from "@/lib/fareharborAvailability";
import { getHelicopterTour } from "@/lib/helicopterTours";
import DayBookingClient, { type Slot } from "./DayBookingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

function normalizeSlotsForDay(availabilities: any[], day: string): Slot[] {
  return availabilities
    .filter((availability) => {
      const startAt = String(availability?.start_at ?? availability?.startAt ?? "");
      return startAt.slice(0, 10) === day;
    })
    .sort((a, b) =>
      String(a?.start_at ?? a?.startAt ?? "").localeCompare(
        String(b?.start_at ?? b?.startAt ?? ""),
      ),
    )
    .map((availability) => ({
      pk: Number(availability?.pk ?? availability?.availability_pk ?? 0),
      start_at: availability?.start_at ?? availability?.startAt,
      startAt: availability?.startAt ?? availability?.start_at,
      capacity: availability?.capacity ?? null,
      customer_type_rates: availability?.customer_type_rates ?? [],
    }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ company: string; item: string; day: string }>;
}) {
  const { company, item, day } = await params;
  const [availabilities, tour] = await Promise.all([
    getFareHarborAvailabilities(company, item, day, day),
    getHelicopterTour(company, item),
  ]);
  const initialSlots = normalizeSlotsForDay(availabilities, day);

  let durationMinutes: number | null = null;
  if (tour?.description) {
    const durationMatch = tour.description.match(/\b(\d+(?:\.\d+)?)\s*Hours?\b/i);
    if (durationMatch) {
      const durationHours = parseFloat(durationMatch[1]);
      durationMinutes = Math.round(durationHours * 60);
    }
  }

  return (
    <DayBookingClient
      company={company}
      item={item}
      day={day}
      initialSlots={initialSlots}
      tourDurationMinutes={durationMinutes}
    />
  );
}
