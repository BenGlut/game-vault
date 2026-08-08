# Sécurité

## Principe central

Les variables d'environnement ne protègent PAS ce qui part au navigateur.
Le site est statique : **tout ce qui est dans `data/public/` est public**.

- Repo privé `game-vault-data` = source de vérité (prix, vendeurs, notes, preuves).
- `pnpm vault publish` filtre selon `publish.config.json` :

```json
{
  "publish": {
    "purchase_price": false,
    "seller_name": false,
    "order_reference": false,
    "private_notes": false,
    "acquisition_date": true,
    "condition": true,
    "ownership_status": true,
    "estimates": true,
    "marketplace": true
  }
}
```

Le test `tests/publish.test.ts` vérifie qu'aucun vendeur, référence, note privée ou
prix d'achat ne fuit dans l'export.

## Tokens et secrets

- Aucun token dans les repos (public OU privé). `.env` est gitignoré, `.env.example` documente.
- Auth GitHub : `gh auth` en local, `GITHUB_TOKEN` implicite en Actions.
- Secrets supplémentaires → GitHub Secrets uniquement.

## Durcissement GitHub

- Dependabot (`.github/dependabot.yml`) — mises à jour hebdo.
- CodeQL (`.github/workflows/codeql.yml`) — analyse statique.
- Protection de branche `main` : CI verte requise avant merge.
- Le repo privé n'est jamais référencé par le build public (le site build
  uniquement depuis `data/public/` commité).
