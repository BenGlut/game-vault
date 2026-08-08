// Serveur statique minimal pour les tests e2e (sert ./out sur :4173) — zéro dépendance.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "out");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (file.endsWith("/")) file += "index.html";
    if (!fs.existsSync(file) && fs.existsSync(file + "/index.html")) file += "/index.html";
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      const notFound = path.join(root, "404.html");
      res.writeHead(404, { "content-type": "text/html" });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "404");
      return;
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(file));
  })
  .listen(4173, () => console.log("serving out/ on http://localhost:4173"));
