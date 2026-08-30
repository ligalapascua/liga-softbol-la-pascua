// Componentes UI base con la paleta de la liga.
import { ActivityIndicator, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/useTheme";
import { bodyStyle, radius, spacing } from "../../lib/theme";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        ...(style as object),
      }}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: 20,
        fontWeight: "600",
        color: theme.text,
        marginBottom: spacing.md,
        fontFamily: "Poppins_600SemiBold",
      }}
    >
      {children}
    </Text>
  );
}

export function MutedText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: theme.textMuted,
        fontSize: 13,
        fontFamily: "Inter_400Regular",
        ...(style as object),
      }}
    >
      {children}
    </Text>
  );
}

export function Badge({
  text,
  color,
  bg,
}: {
  text: string;
  color?: string;
  bg?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: bg ?? theme.surfaceAlt,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 2,
      }}
    >
      <Text
        style={{
          color: color ?? theme.textMuted,
          fontSize: 11,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function Loading({ label = "Cargando..." }: { label?: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingVertical: spacing.xxl,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
      }}
    >
      <ActivityIndicator color={theme.primary} />
      <Text style={{ color: theme.textMuted, ...bodyStyle }}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
          fontFamily: "Poppins_500Medium",
        }}
      >
        {title}
      </Text>
      {message ? <MutedText>{message}</MutedText> : null}
      {onRetry ? (
        <Text
          onPress={onRetry}
          style={{
            color: theme.primary,
            fontWeight: "600",
            marginTop: spacing.sm,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          Reintentar
        </Text>
      ) : null}
    </View>
  );
}

export function Skeleton({ width = "100%", height = 16 }: { width?: number | string; height?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: width as number,
        height,
        backgroundColor: theme.skeleton,
        borderRadius: radius.sm,
        opacity: 0.6,
      }}
    />
  );
}
