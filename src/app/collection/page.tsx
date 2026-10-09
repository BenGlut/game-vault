import { Suspense } from "react";
import CollectionView from "@/components/views/CollectionView";

export default function Page() {
  return (
    <Suspense>
      <CollectionView />
    </Suspense>
  );
}
