export interface ParsedArgs {
  positionals: string[];
  options: Record<string, string | boolean>;
}

/** Parse `--cle valeur`, `--cle=valeur`, drapeaux `--yes`, et positionnels. */
export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq !== -1) {
        options[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          options[a.slice(2)] = next;
          i++;
        } else {
          options[a.slice(2)] = true;
        }
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, options };
}

export function optStr(o: Record<string, string | boolean>, key: string): string | undefined {
  const v = o[key];
  return typeof v === "string" ? v : undefined;
}

export function optNum(o: Record<string, string | boolean>, key: string): number | undefined {
  const v = optStr(o, key);
  if (v === undefined) return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`--${key} doit être un nombre (reçu: ${v})`);
  return n;
}

export function optBool(o: Record<string, string | boolean>, key: string): boolean {
  return o[key] === true || o[key] === "true";
}
