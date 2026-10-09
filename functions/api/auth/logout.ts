import { clearSessionCookie } from "../../../src/server/auth";
import { json, type PagesFunction } from "../../../src/server/cf";

export const onRequestPost: PagesFunction = () => json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
