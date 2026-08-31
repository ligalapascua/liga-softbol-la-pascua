import { useCallback, useEffect, useState, createElement } from "react";
import { Linking, Platform, Pressable, ScrollView, Text, View, Image, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing } from "../../lib/theme";
import { Loading, EmptyState } from "../../components/ui";

interface ArticleData {
  title: string;
  image: string;
  bodyHtml: string;
  url: string;
}

// Endpoint unificado para obtener artículos de noticias.
// - En Render: el servidor Express sirve /news-article directamente.
// - En Netlify: un redirect en netlify.toml envía /news-article a la función.
// - En nativo: usamos la URL pública de Netlify como fallback.
const NEWS_ENDPOINT =
  Platform.OS === "web"
    ? "/news-article"
    : "https://ligalapascua.netlify.app/news-article";

export default function NewsArticleScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageAspect, setImageAspect] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${NEWS_ENDPOINT}?slug=${encodeURIComponent(slug)}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setArticle(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el artículo");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // Actualizar el título del header/navegador con el título real del artículo.
  useEffect(() => {
    navigation.setOptions({
      title: article?.title || "Noticia",
      headerTitle: article?.title || "Noticia",
    });
  }, [navigation, article]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      style={{ backgroundColor: theme.bg }}
    >
      {/* Header con botón de retroceso */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ArrowLeft color={theme.primary} size={18} />
          <Text style={{ color: theme.primary, fontSize: 14, fontFamily: font.semibold }}>
            Volver
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
          <Loading label="Cargando artículo…" />
        </View>
      ) : error ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
          <EmptyState title="No se pudo cargar el artículo" message={error} onRetry={load} />
        </View>
      ) : article ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          {/* Imagen destacada */}
          {article.image ? (
            <Image
              source={{ uri: article.image }}
              style={{
                width: "100%",
                // Altura proporcional a la anchura, sin recortar.
                // Si aún no sabemos el aspect ratio, usamos 16:9 como fallback.
                aspectRatio: imageAspect ?? 16 / 9,
                borderRadius: radius.lg,
                marginBottom: spacing.md,
                backgroundColor: theme.surfaceAlt,
              }}
              resizeMode="contain"
              accessibilityLabel={article.title}
              onLoad={(e) => {
                const { width: w, height: h } = e.nativeEvent.source;
                if (w > 0 && h > 0) setImageAspect(w / h);
              }}
            />
          ) : null}

          {/* Título */}
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              lineHeight: 28,
              fontFamily: font.bold,
              marginBottom: spacing.md,
            }}
          >
            {article.title}
          </Text>

          {/* Cuerpo del artículo */}
          {article.bodyHtml ? (
            <ArticleBody html={article.bodyHtml} theme={theme} />
          ) : (
            <Text style={{ color: theme.textMuted, fontSize: 14 }}>
              No hay contenido disponible.
            </Text>
          )}

          {/* Botón para ver el artículo original */}
          <Pressable
            onPress={() => article.url && Linking.openURL(article.url)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.xs,
                marginTop: spacing.xl,
                paddingVertical: spacing.md,
                borderRadius: radius.lg,
                backgroundColor: theme.primaryDark,
                opacity: pressed ? 0.85 : 1,
              },
              elevation(1),
            ]}
          >
            <ExternalLink color="#FFFFFF" size={14} />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: font.semibold }}>
              Ver artículo original
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

/**
 * Renderiza el HTML del cuerpo del artículo.
 * En web usa un iframe con srcDoc para máxima fidelidad y aislamiento de estilos.
 * En native, parsea los <p> y <ol> a componentes React Native.
 */
function ArticleBody({ html, theme }: { html: string; theme: any }) {
  if (Platform.OS === "web") {
    const styledHtml = `<style>
      body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif;
             color: ${theme.text}; font-size: 15px; line-height: 1.6; }
      p { margin: 0 0 12px 0; }
      ol { margin: 0 0 12px 0; padding-left: 20px; }
      li { margin-bottom: 4px; }
      strong { font-weight: 700; }
      a { color: ${theme.primary}; }
    </style>${html}`;
    return createElement("iframe", {
      srcDoc: styledHtml,
      style: { width: "100%", height: 600, border: "none", borderRadius: 8 },
      sandbox: "allow-same-origin",
    });
  }

  // Native: parsear párrafos y listas
  const blocks = parseHtmlBlocks(html);
  return (
    <View style={{ gap: spacing.sm }}>
      {blocks.map((block, i) => {
        if (block.type === "list") {
          return (
            <View key={i} style={{ paddingLeft: spacing.md }}>
              {block.items.map((item, j) => (
                <View key={j} style={{ flexDirection: "row", gap: spacing.xs }}>
                  <Text style={{ color: theme.textMuted, fontSize: 15, fontFamily: font.medium }}>
                    {j + 1}.
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 15,
                      lineHeight: 22,
                      fontFamily: font.regular,
                      flex: 1,
                    }}
                  >
                    {stripHtml(item)}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text
            key={i}
            style={{
              color: theme.text,
              fontSize: 15,
              lineHeight: 22,
              fontFamily: font.regular,
            }}
          >
            {stripHtml(block.content)}
          </Text>
        );
      })}
    </View>
  );
}

interface Block {
  type: "paragraph" | "list";
  content: string;
  items: string[];
}

function parseHtmlBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  // Dividir por <p> y <ol>
  const parts = html.split(/<(?:p|ol)[^>]*>/i);
  for (const part of parts) {
    if (!part.trim()) continue;
    // Detectar si era una lista
    const listMatch = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (part.includes("</li>")) {
      const items = part
        .split(/<li[^>]*>/i)
        .slice(1)
        .map((item) => item.replace(/<\/li>[\s\S]*/i, "").trim())
        .filter(Boolean);
      if (items.length > 0) {
        blocks.push({ type: "list", content: "", items });
      }
      continue;
    }
    const content = part.replace(/<\/p>[\s\S]*/i, "").replace(/<\/?[^>]+(>|$)/g, "").trim();
    if (content) {
      blocks.push({ type: "paragraph", content, items: [] });
    }
  }
  return blocks;
}

function stripHtml(html: string): string {
  return html
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "$1")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "$1")
    .replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&amp;/g, "&")
    .trim();
}
