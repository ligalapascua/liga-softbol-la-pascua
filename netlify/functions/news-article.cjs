/**
 * Netlify Function: news-article
 * Extrae el contenido de un artículo de noticias del sitio de LeagueRepublic.
 *
 * Uso: /.netlify/functions/news-article?slug=<slug>
 * Devuelve: { title, image, bodyHtml, url }
 *
 * La API de LeagueRepublic no tiene endpoint de noticias, pero el sitio
 * público sirve cada artículo en /newsArticle/<slug>.html con el contenido
 * dentro de <div class="news-article-body">. Esta función obtiene el HTML,
 * extrae title (og:title), image (og:image) y el cuerpo, y los devuelve
 * como JSON para que la app los renderice nativamente.
 *
 * Usa el módulo https nativo de Node (sin dependencias externas) para
 * máxima compatibilidad con cualquier runtime de Netlify Functions.
 */

const https = require("https");
const zlib = require("zlib");

const SITE = "sofbollapascua.leaguerepublic.com";

exports.handler = async (event) => {
  const slug = event.queryStringParameters && event.queryStringParameters.slug;
  if (!slug) {
    return json(400, { error: "Falta el parámetro 'slug'" });
  }

  const path = `/newsArticle/${slug}.html`;
  const url = `https://${SITE}${path}`;

  try {
    const html = await fetchHtml(url);
    let title = "";
    let image = "";
    let bodyHtml = "";

    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    if (titleMatch) title = decodeHtmlEntities(titleMatch[1]);

    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
    if (imageMatch) image = imageMatch[1];

    // Extraer el cuerpo: <div class="flex middle stack news-article-body">
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
      return json(404, { error: "Artículo no encontrado" });
    }

    return json(200, { title, image, bodyHtml, url });
  } catch (e) {
    return json(500, { error: e && e.message ? e.message : "Error interno" });
  }
};

/**
 * Descarga el HTML de una URL usando https nativo, soportando gzip/deflate.
 * CloudFront requiere headers de navegador completos o devuelve 403.
 */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
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

function json(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
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
