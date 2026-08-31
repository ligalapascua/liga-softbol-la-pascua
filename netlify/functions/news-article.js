/**
 * Netlify Function: news-article
 * Extrae el contenido de un artículo de noticias del sitio de LeagueRepublic.
 *
 * Uso: /.netlify/functions/news-article?slug=<slug>
 * Devuelve: { title, image, bodyHtml }
 *
 * La API de LeagueRepublic no tiene endpoint de noticias, pero el sitio
 * público sirve cada artículo en /newsArticle/<slug>.html con el contenido
 * dentro de <div class="news-article-body">. Esta función obtiene el HTML,
 * extrae title (og:title), image (og:image) y el cuerpo, y los devuelve
 * como JSON para que la app los renderice nativamente.
 */

const SITE = "https://sofbollapascua.leaguerepublic.com";

exports.handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  if (!slug) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Falta el parámetro 'slug'" }),
    };
  }

  try {
    const url = `${SITE}/newsArticle/${slug}.html`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `No se pudo obtener el artículo (${resp.status})` }),
      };
    }

    const html = await resp.text();

    // Extraer og:title
    let title = "";
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    if (titleMatch) {
      title = decodeHtmlEntities(titleMatch[1]);
    }

    // Extraer og:image
    let image = "";
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
    if (imageMatch) {
      image = imageMatch[1];
    }

    // Extraer el cuerpo del artículo: <div class="...news-article-body...">
    // hasta el </div> que cierra la sección.
    let bodyHtml = "";
    const bodyStartIdx = html.indexOf('class="flex middle stack news-article-body"');
    if (bodyStartIdx > 0) {
      // Buscar el <div class="w100 padding"> interno que contiene los <p>
      const contentStart = html.indexOf('class="w100 padding"', bodyStartIdx);
      if (contentStart > 0) {
        // Encontrar el </div> que cierra este contenedor
        const afterContent = html.indexOf("</div>", contentStart);
        if (afterContent > 0) {
          bodyHtml = html.substring(contentStart, afterContent);
          // Limpiar: quitar el atributo class inicial y el <p></p> vacío
          bodyHtml = bodyHtml.replace(/^class="w100 padding">\s*/, "");
          // Quitar <p></p> vacíos
          bodyHtml = bodyHtml.replace(/<p>\s*<\/p>/g, "");
          // Convertir <br> a saltos
          bodyHtml = bodyHtml.replace(/<br\s*\/?>/g, "<br/>");
        }
      }
    }

    if (!bodyHtml && !title) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Artículo no encontrado" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
      body: JSON.stringify({ title, image, bodyHtml, url }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e instanceof Error ? e.message : "Error interno" }),
    };
  }
};

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
