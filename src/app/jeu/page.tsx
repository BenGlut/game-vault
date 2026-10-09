import { Suspense } from "react";
import GameView from "@/components/views/GameView";

export default function Page() {
  return (
    <Suspense>
      <GameView />
    </Suspense>
  );
}
