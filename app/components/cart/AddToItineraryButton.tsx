"use client";

import { useCart } from "./CartContext";

export default function AddToItineraryButton(props: {
  company: string;
  itemPk: number;
  title: string;
  headline?: string;
  image?: string;
  supplierLabel?: string;
}) {
  const { addItem, open } = useCart();

  return (
    <button
      type="button"
      onClick={(e) => {
        // prevent card Link navigation
        e.preventDefault();
        e.stopPropagation();

        addItem(
          {
            company: props.company,
            itemPk: props.itemPk,
            title: props.title,
            headline: props.headline,
            image: props.image,
            supplierLabel: props.supplierLabel,
          },
          1,
        );

        open();
      }}
      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
    >
      + Add to itinerary
    </button>
  );
}
