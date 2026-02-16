import Link from "next/link";

type CardProps = {
  title: string;
  description: string;
  meta?: string;
  price?: string;
  image?: string;
  href: string;
};

export default function Card({
  title,
  description,
  meta,
  price,
  image,
  href,
}: CardProps) {
  return (
    <Link
      href={href}
      className="group block mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
    >
      {image ? (
        <div className="relative h-56 w-full overflow-hidden">
          {/* Using img is fine here; you can switch to next/image later */}
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      ) : null}

      <div className="p-6">
        <div className="flex items-start gap-4">
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <div className="ml-auto text-right">
            {price ? (
              <div className="text-white font-semibold">{price}</div>
            ) : null}
            {meta ? <div className="text-white/60 text-sm">{meta}</div> : null}
          </div>
        </div>

        <p className="mt-3 text-white/70">{description}</p>

        <div className="mt-5 text-[#4CC9F0] font-medium">View details →</div>
      </div>
    </Link>
  );
}
