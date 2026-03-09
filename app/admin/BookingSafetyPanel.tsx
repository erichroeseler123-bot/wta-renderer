"use client";

export default function BookingSafetyPanel(props: {
  bookingsEnabled: number;
  onToggleBookings: (enabled: boolean) => void;
  msg?: string;
}) {
  const { bookingsEnabled, onToggleBookings, msg } = props;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Booking safety</div>
          <div className="text-lg font-semibold">
            Bookings: {bookingsEnabled ? "ENABLED" : "DISABLED"}
          </div>
          <div className="mt-1 text-xs text-white/50">
            (Env FH_BOOKINGS_ENABLED is still the master kill switch.)
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onToggleBookings(false)}
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 hover:bg-black/30"
        >
          Disable
        </button>
        <button
          onClick={() => onToggleBookings(true)}
          className="rounded-xl border border-white/10 bg-emerald-600/30 px-4 py-2 hover:bg-emerald-600/40"
        >
          Enable
        </button>
      </div>

      {msg ? <div className="mt-3 text-sm text-white/70">{msg}</div> : null}
    </div>
  );
}
