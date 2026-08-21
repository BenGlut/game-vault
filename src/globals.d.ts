/**
 * Déclarations pour les imports à effet de bord de feuilles de style.
 * TypeScript 6 refuse `import "./globals.css"` sans déclaration (TS2882) ;
 * Next.js gère lui-même ces imports au build.
 */
declare module "*.css";
