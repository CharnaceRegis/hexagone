import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Session } from "../lib/sessions";

function formatDate(date: Date | null): string {
  if (!date) return "À l'instant";
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionRow({ session }: { session: Session }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/${session.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(session.createdAt)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{session.values.length} val.</Text>
        </View>
      </View>

      <Text style={styles.sequence} numberOfLines={1}>
        {session.values.join(" → ")}
      </Text>

      <View style={styles.stats}>
        <Text style={styles.stat}>min {session.min}</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>moy {session.avg}</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>max {session.max}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#6B7A99",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#1D3461",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sequence: {
    fontSize: 14,
    color: "#2C3E6B",
    fontFamily: "Courier",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stat: {
    fontSize: 11,
    color: "#6B7A99",
  },
  statDot: {
    fontSize: 11,
    color: "#C5CCDB",
  },
  chevron: {
    marginLeft: "auto",
    fontSize: 20,
    color: "#C5CCDB",
    fontWeight: "bold",
  },
});
