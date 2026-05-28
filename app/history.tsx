import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSessions } from "../hooks/useSessions";
import type { Session } from "../lib/sessions";

// Formate une date Firestore en chaîne lisible "27 mai à 14h32"
function formatDate(date: Date | null): string {
  if (!date) return "À l'instant";
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  // ── useQuery TanStack Query : liste des sessions ─────────
  const { data: sessions, isLoading, isError, error, refetch } = useSessions();

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <ActivityIndicator size="large" color="#1D3461" />
        <Text style={styles.helperText}>Chargement des sessions…</Text>
      </SafeAreaView>
    );
  }

  // ── Erreur ───────────────────────────────────────────────
  if (isError) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Impossible de charger les sessions</Text>
        <Text style={styles.errorDetails}>
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={sessions ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {sessions?.length ?? 0} session
              {(sessions?.length ?? 0) > 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => <SessionRow session={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Aucune session sauvegardée</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.backButtonText}>← Retour au compteur</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Ligne d'une session ──────────────────────────────────
function SessionRow({ session }: { session: Session }) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/${session.id}`)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{formatDate(session.createdAt)}</Text>
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>{session.values.length} val.</Text>
        </View>
      </View>

      <Text style={styles.itemSequence} numberOfLines={1}>
        {session.values.join(" → ")}
      </Text>

      <View style={styles.itemStats}>
        <Text style={styles.itemStat}>min {session.min}</Text>
        <Text style={styles.itemStatDot}>·</Text>
        <Text style={styles.itemStat}>moy {session.avg}</Text>
        <Text style={styles.itemStatDot}>·</Text>
        <Text style={styles.itemStat}>max {session.max}</Text>
        <Text style={styles.itemChevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  center: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  helperText: {
    fontSize: 14,
    color: "#6B7A99",
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: "#1D3461",
    fontWeight: "600",
  },
  errorDetails: {
    fontSize: 12,
    color: "#6B7A99",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1D3461",
  },
  retryButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    color: "#6B7A99",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  item: {
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDate: {
    fontSize: 12,
    color: "#6B7A99",
    fontWeight: "600",
  },
  itemBadge: {
    backgroundColor: "#1D3461",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  itemSequence: {
    fontSize: 14,
    color: "#2C3E6B",
    fontFamily: "Courier",
  },
  itemStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemStat: {
    fontSize: 11,
    color: "#6B7A99",
  },
  itemStatDot: {
    fontSize: 11,
    color: "#C5CCDB",
  },
  itemChevron: {
    marginLeft: "auto",
    fontSize: 20,
    color: "#C5CCDB",
    fontWeight: "bold",
  },
  separator: {
    height: 8,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7A99",
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1D3461",
  },
  backButtonText: {
    fontSize: 14,
    color: "#1D3461",
    fontWeight: "600",
  },
});
