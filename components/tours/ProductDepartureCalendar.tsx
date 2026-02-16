"use client";

import { useRouter } from "next/navigation";
import AvailabilityCalendar from "./AvailabilityCalendar";

export default function ProductDepartureCalendar({
  company,
  itemPk,
}: {
  company: string;
  itemPk: number;
}) {
  const router = useRouter();

  return (
    <AvailabilityCalendar
      company={company}
      item={itemPk}
      onPickSlot={({ startAt }) => {
        const day = startAt.slice(0, 10);
        router.push(`/tours/${company}/${itemPk}/calendar/${day}`);
      }}
    />
  );
}
