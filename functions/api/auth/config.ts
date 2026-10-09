import { json, type PagesFunction } from "../../../src/server/cf";

/** Identifiant client OAuth public, lu par la page de connexion. */
export const onRequestGet: PagesFunction = ({ env }) => json({ googleClientId: env.GOOGLE_CLIENT_ID || null });
