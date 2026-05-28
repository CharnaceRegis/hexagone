import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDeleteSession, useSession } from "../hooks/useSessions";

function formatDate(date: Date | null): string {
  if (!date) return "À l'instant";
  return date.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionDetailScreen() {
  // ── Récupération du param d'URL ──────────────────────────
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── useQuery : détail de la session ──────────────────────
  const { data: session, isLoading, isError, error } = useSession(id);

  // ── useMutation : suppression ────────────────────────────
  const deleteSession = useDeleteSession();

  const handleDelete = () => {
    deleteSession.mutate(id, {
      onSuccess: () => router.replace("/history"),
      onError: (err) => {
        Alert.alert(
          "Erreur",
          err instanceof Error ? err.message : "Suppression impossible",
        );
      },
    });
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <ActivityIndicator size="large" color="#1D3461" />
      </SafeAreaView>
    );
  }

  // ── Erreur ───────────────────────────────────────────────
  if (isError || !session) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom"]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Session introuvable</Text>
        <Text style={styles.errorDetails}>
          {error instanceof Error ? error.message : ""}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Date */}
        <Text style={styles.date}>{formatDate(session.createdAt)}</Text>

        {/* Valeur finale */}
        <View style={styles.finalCard}>
          <Text style={styles.finalLabel}>Valeur finale</Text>
          <Text style={styles.finalValue}>
            {session.values[session.values.length - 1] ?? 0}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={styles.statValue}>{session.min}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Moy</Text>
              <Text style={styles.statValue}>{session.avg}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={styles.statValue}>{session.max}</Text>
            </View>
          </View>
        </View>

        {/* Séquence */}
        <View style={styles.sequenceCard}>
          <Text style={styles.cardTitle}>
            Séquence ({session.values.length} valeurs)
          </Text>
          <Text style={styles.sequenceText}>{session.values.join(" → ")}</Text>
        </View>

        {/* Bouton supprimer */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleteSession.isPending && styles.buttonDisabled,
          ]}
          onPress={handleDelete}
          disabled={deleteSession.isPending}
        >
          {deleteSession.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Supprimer la session</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: 16,
    gap: 16,
  },
  date: {
    fontSize: 13,
    color: "#6B7A99",
    textAlign: "center",
    textTransform: "capitalize",
  },
  finalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  finalLabel: {
    fontSize: 12,
    color: "#6B7A99",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  finalValue: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#F5A623",
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sequenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1D3461",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7A99",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F5A623",
  },
  sequenceText: {
    fontSize: 14,
    color: "#2C3E6B",
    fontFamily: "Courier",
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: "#C0392B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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
