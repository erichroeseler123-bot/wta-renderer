export type Testimonial = {
  name: string;
  location: string;
  date: string;
  rating: number;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    location: "Seattle, WA",
    date: "July 2025",
    rating: 5,
    quote:
      "Our Juneau tour timing was perfect for our ship window and checkout was very clear from start to finish.",
  },
  {
    name: "David R.",
    location: "Dallas, TX",
    date: "August 2025",
    rating: 5,
    quote:
      "We liked seeing real departure options before paying. The confirmation page updates were especially helpful.",
  },
  {
    name: "Priya K.",
    location: "Vancouver, BC",
    date: "June 2025",
    rating: 4,
    quote:
      "Easy process for a family group. We found a cruise-friendly option quickly and the operator details were clear.",
  },
  {
    name: "Michael T.",
    location: "Phoenix, AZ",
    date: "September 2025",
    rating: 5,
    quote:
      "Booking felt reliable and transparent. We appreciated seeing pricing and status without any surprises.",
  },
  {
    name: "Elena S.",
    location: "San Diego, CA",
    date: "July 2025",
    rating: 5,
    quote:
      "Great for first-time Alaska cruisers. The site made it easy to pick tours that fit our short port calls.",
  },
  {
    name: "Chris B.",
    location: "Denver, CO",
    date: "August 2025",
    rating: 4,
    quote:
      "The cart and checkout flow was smooth on mobile while we were on the ship Wi-Fi.",
  },
];
