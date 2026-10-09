import { PRIVATE_BUILD } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import ManageClient from "@/components/manage/ManageClient";

export default function ManagePage() {
  return (
    <div>
      <PageTitle
        title="Gestion"
        sub="Modifier la collection, la wishlist et le suivi des commandes. Les autres pages se mettent à jour à la prochaine synchronisation."
      />
      {PRIVATE_BUILD ? (
        <ManageClient />
      ) : (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Disponible uniquement sur la copie privée de la collection.
        </p>
      )}
    </div>
  );
}
