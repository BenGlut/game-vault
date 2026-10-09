import { Suspense } from "react";
import OrdersView from "@/components/views/OrdersView";

export default function Page() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
