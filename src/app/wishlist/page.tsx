import { getGameRows, getQuotes } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import WishlistClient from "@/components/WishlistClient";
import { GameDrawerProvider } from "@/components/GameDrawer";

export default function WishlistPage() {
  const rows = getGameRows().filter((r) => r.items.some((i) => i.status === "wishlist"));
  return (
    <div>
      <PageTitle title="Wishlist" sub="Jeux recherchés — pas encore possédés ni commandés" />
      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          La wishlist est vide.
          <div className="mt-2 text-xs">
            L&apos;agent ajoute un jeu en wishlist via{" "}
            <code className="font-mono">pnpm vault add-inventory --game … --status wishlist</code>.
          </div>
        </div>
      ) : (
        <GameDrawerProvider quotes={getQuotes()}>
          <WishlistClient rows={rows} />
        </GameDrawerProvider>
      )}
    </div>
  );
}
