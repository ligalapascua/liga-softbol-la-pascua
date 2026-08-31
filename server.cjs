/**
 * Servidor Express para Render.
 *
 * Sirve:
 * 1. Archivos estáticos de dist/ (la PWA compilada)
 * 2. Proxy /api/* -> https://api.leaguerepublic.com/json/* (evita CORS)
 * 3. Endpoint /news-article?slug=... (extrae artículos del sitio de la liga)
 * 4. SPA fallback: todas las demás rutas sirven index.html
 *
 * En Netlify esto se hace con netlify.toml (redirects) + functions,
 * pero Render Static Sites no soporta proxy redirects, así que usamos
 * un Web Service con Express.
 */
const express = require("express");
const path = require("path");
const https = require("https");
const zlib = require("zlib");

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");

const LR_API_HOST = "api.leaguerepublic.com";
const LR_SITE_HOST = "sofbollapascua.leaguerepublic.com";

// ── 1. Proxy /api/* -> https://api.leaguerepublic.com/json/* ──────────────
app.use("/api", (req, res) => {
  const apiPath = "/json" + req.url;
  proxyRequest(LR_API_HOST, apiPath, req, res);
});

// ── 2. Endpoint /news-article?slug=... ───────────────────────────────────
app.get("/news-article", async (req, res) => {
  const slug = req.query.slug;
  if (!slug) {
    return res.status(400).json({ error: "Falta el parámetro 'slug'" });
  }

  const articlePath = "/newsArticle/" + slug + ".html";
  const articleUrl = "https://" + LR_SITE_HOST + articlePath;

  try {
    const html = await fetchHtml(articleUrl);
    let title = "";
    let image = "";
    let bodyHtml = "";

    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    if (titleMatch) title = decodeHtmlEntities(titleMatch[1]);

    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
    if (imageMatch) image = imageMatch[1];

    const bodyMarker = 'class="flex middle stack news-article-body"';
    const bodyStartIdx = html.indexOf(bodyMarker);
    if (bodyStartIdx > 1) {
      const contentStart = html.indexOf('class="w100 padding"', bodyStartIdx);
      if (contentStart > 1) {
        const afterContent = html.indexOf("</div>", contentStart);
        if (afterContent > 1) {
          bodyHtml = html.substring(contentStart, afterContent);
          bodyHtml = bodyHtml.replace(/^class="w100 padding">\s*/, "");
          bodyHtml = bodyHtml.replace(/<p>\s*<\/p>/g, "");
        }
      }
    }

    if (!bodyHtml && !title) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.set("Cache-Control", "public, max-age=3600");
    res.json({ title, image, bodyHtml, url: articleUrl });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : "Error interno" });
  }
});

// ── 3. Archivos estáticos de dist/ ───────────────────────────────────────
app.use(express.static(DIST));

// ── 4. SPA fallback: todas las demás rutas -> index.html ─────────────────
// Express 5 requiere un parámetro con nombre en lugar de "*".
app.get("*splat", (_req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log("Servidor escuchando en el puerto " + PORT);
});

// ── Helpers ──────────────────────────────────────────────────────────────

function proxyRequest(host, urlPath, req, res) {
  const options = {
    hostname: host,
    path: urlPath,
    method: req.method,
    headers: {
      "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      Accept: "application/json, */*",
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 502);
    Object.keys(proxyRes.headers).forEach((key) => {
      if (key !== "transfer-encoding") {
        res.set(key, proxyRes.headers[key]);
      }
    });
    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => {
    res.status(502).json({ error: "Error al conectar con la API" });
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("HTTP " + res.statusCode));
          return;
        }
        const chunks = [];
        const encoding = res.headers["content-encoding"];
        let stream = res;
        if (encoding === "gzip") stream = res.pipe(zlib.createGunzip());
        else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());
        stream.on("data", function (c) {
          chunks.push(c);
        });
        stream.on("end", function () {
          resolve(Buffer.concat(chunks).toString("utf-8"));
        });
        stream.on("error", reject);
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, function () {
      req.destroy(new Error("Timeout"));
    });
  });
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&iexcl;/g, "¡")
    .replace(/&iquest;/g, "¿")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
