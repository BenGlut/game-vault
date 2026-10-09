import { json, type PagesFunction } from "../../../src/server/cf";

export const onRequestGet: PagesFunction = ({ data }) => json({ email: data.email });
