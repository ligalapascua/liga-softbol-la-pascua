// Componentes UI base con la paleta de la liga.
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../lib/useTheme";
import { elevation, font, radius, spacing } from "../../lib/theme";

export function Card({
  children,
  style,
  level = 1,
  padded = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  level?: 0 | 1 | 2 | 3;
  padded?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: radius.xl,
          padding: padded ? spacing.lg : 0,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          overflow: "hidden",
        },
        elevation(level),
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Encabezado de sección con barra de acento y acción opcional. */
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            width: 3,
            height: 18,
            borderRadius: radius.pill,
            backgroundColor: theme.primary,
            marginRight: spacing.sm,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              color: theme.text,
              fontFamily: font.display,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontSize: 12,
                color: theme.textMuted,
                fontFamily: font.regular,
                marginTop: 1,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text
            style={{
              color: theme.primary,
              fontSize: 13,
              fontFamily: font.semibold,
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <SectionHeader title={String(children)} />;
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
        fontFamily: font.regular,
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
  small,
}: {
  text: string;
  color?: string;
  bg?: string;
  small?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: bg ?? theme.surfaceAlt,
        borderRadius: radius.pill,
        paddingHorizontal: small ? spacing.sm : spacing.md,
        paddingVertical: small ? 1 : 3,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: color ?? theme.textMuted,
          fontSize: small ? 10 : 11,
          fontFamily: font.semibold,
          letterSpacing: 0.3,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

/** Control segmentado moderno para filtros de 2-3 opciones. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.surfaceAlt,
        borderRadius: radius.pill,
        padding: 3,
        borderWidth: 1,
        borderColor: theme.borderSubtle,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              {
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                alignItems: "center",
                backgroundColor: active ? theme.surface : "transparent",
              },
              active ? elevation(1) : null,
            ]}
          >
            <Text
              style={{
                color: active ? theme.primary : theme.textMuted,
                fontSize: 13,
                fontFamily: active ? font.semibold : font.medium,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Skeleton con animación de pulso. */
export function Skeleton({
  width = "100%",
  height = 16,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          backgroundColor: theme.skeleton,
          borderRadius: radius.sm,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** Placeholder de lista mientras carga. */
export function SkeletonList({ rows = 4, height = 64 }: { rows?: number; height?: number }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} style={{ borderRadius: radius.lg }} />
      ))}
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <SkeletonList rows={3} />
      {label ? (
        <Text
          style={{
            color: theme.textFaint,
            fontFamily: font.regular,
            fontSize: 12,
            textAlign: "center",
            marginTop: spacing.sm,
          }}
        >
          {label}
        </Text>
      ) : null}
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
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: theme.surfaceAlt,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: theme.borderSubtle,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 15,
          textAlign: "center",
          fontFamily: font.displayMedium,
        }}
      >
        {title}
      </Text>
      {message ? (
        <Text
          style={{
            color: theme.textMuted,
            fontSize: 13,
            textAlign: "center",
            fontFamily: font.regular,
          }}
        >
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ color: theme.textInverse, fontFamily: font.semibold, fontSize: 13 }}>
            Reintentar
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
