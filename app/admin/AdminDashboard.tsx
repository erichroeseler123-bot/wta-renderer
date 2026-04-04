"use client";

import BookingSafetyPanel from "./BookingSafetyPanel";
import DccCallbackPanel from "./DccCallbackPanel";
import DccProbePanel from "./DccProbePanel";
import HandoffDebugPanel from "./HandoffDebugPanel";
import RecoveryPanel from "./RecoveryPanel";
import ToursForSalePanel from "./ToursForSalePanel";
import type { Provider, RecoveryOrder, HandoffDebugRow, DccCallbackRow, DccProbeResult } from "./useAdminData";

export default function AdminDashboard(props: {
  bookingsEnabled: number;
  providers: Provider[];
  recoveryOrders: RecoveryOrder[];
  handoffRows: HandoffDebugRow[];
  dccCallbackRows: DccCallbackRow[];
  dccProbeRunning: boolean;
  dccProbeResult: DccProbeResult | null;
  msg: string;
  onToggleBookings: (enabled: boolean) => void;
  onProviderHidden: (company: string, hidden: boolean) => void;
  onTourHidden: (key: string, hidden: boolean) => void;
  onHideAll: (company: string, hideAll: boolean) => void;
  onRetryOrderBooking: (orderId: string) => void;
  onRefreshHandoffs: () => void;
  onRefreshDccCallbacks: () => void;
  onRunDccProbe: () => void;
}) {
  const {
    bookingsEnabled,
    providers,
    recoveryOrders,
    handoffRows,
    dccCallbackRows,
    dccProbeRunning,
    dccProbeResult,
    msg,
    onToggleBookings,
    onProviderHidden,
    onTourHidden,
    onHideAll,
    onRetryOrderBooking,
    onRefreshHandoffs,
    onRefreshDccCallbacks,
    onRunDccProbe,
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
      <DccProbePanel onRun={onRunDccProbe} running={dccProbeRunning} result={dccProbeResult} />
      <DccCallbackPanel rows={dccCallbackRows} onRefresh={onRefreshDccCallbacks} />

      <ToursForSalePanel
        providers={providers}
        onProviderHidden={onProviderHidden}
        onTourHidden={onTourHidden}
        onHideAll={onHideAll}
      />
    </>
  );
}
