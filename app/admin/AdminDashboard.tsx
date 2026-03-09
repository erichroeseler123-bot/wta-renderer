"use client";

import BookingSafetyPanel from "./BookingSafetyPanel";
import HandoffDebugPanel from "./HandoffDebugPanel";
import RecoveryPanel from "./RecoveryPanel";
import ToursForSalePanel from "./ToursForSalePanel";
import type { Provider, RecoveryOrder, HandoffDebugRow } from "./useAdminData";

export default function AdminDashboard(props: {
  bookingsEnabled: number;
  providers: Provider[];
  recoveryOrders: RecoveryOrder[];
  handoffRows: HandoffDebugRow[];
  msg: string;
  onToggleBookings: (enabled: boolean) => void;
  onProviderHidden: (company: string, hidden: boolean) => void;
  onTourHidden: (key: string, hidden: boolean) => void;
  onHideAll: (company: string, hideAll: boolean) => void;
  onRetryOrderBooking: (orderId: string) => void;
  onRefreshHandoffs: () => void;
}) {
  const {
    bookingsEnabled,
    providers,
    recoveryOrders,
    handoffRows,
    msg,
    onToggleBookings,
    onProviderHidden,
    onTourHidden,
    onHideAll,
    onRetryOrderBooking,
    onRefreshHandoffs,
  } = props;

  return (
    <>
      <BookingSafetyPanel
        bookingsEnabled={bookingsEnabled}
        onToggleBookings={onToggleBookings}
        msg={msg}
      />

      <RecoveryPanel orders={recoveryOrders} onRetry={onRetryOrderBooking} />
      <HandoffDebugPanel rows={handoffRows} onRefresh={onRefreshHandoffs} />

      <ToursForSalePanel
        providers={providers}
        onProviderHidden={onProviderHidden}
        onTourHidden={onTourHidden}
        onHideAll={onHideAll}
      />
    </>
  );
}
