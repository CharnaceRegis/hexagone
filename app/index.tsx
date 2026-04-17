import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);

  // ── useEffect ─────────────────────────────────────────────
  // S'exécute à chaque fois que count change
  useEffect(() => {
    console.log(`Le compteur vaut maintenant : ${count}`);
    setHistory((prev) => [...prev, count]);
  }, [count]);

  // ── useMemo ───────────────────────────────────────────────
  // Recalculé uniquement quand history change
  const stats = useMemo(() => {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
    return { max, min, avg };
  }, [history]);

  const handleReset = () => {
    setCount(0);
    setHistory([]);
  };

  const handleHistory = () => {
    // On passe l'historique en paramètre URL
    router.push(`/history?data=${JSON.stringify(history)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mon compteur</Text>

      {/* Compteur principal */}
      <Text style={styles.count}>{count}</Text>

      {/* Boutons +/- */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count - 1)}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reset */}
      <TouchableOpacity style={styles.buttonReset} onPress={handleReset}>
        <Text style={styles.resetText}>Remettre à zéro</Text>
      </TouchableOpacity>

      {/* Stats calculées par useMemo */}
      <View style={styles.stats}>
        <Text style={styles.statsTitle}>Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min</Text>
            <Text style={styles.statValue}>{stats.min}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moy</Text>
            <Text style={styles.statValue}>{stats.avg}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={styles.statValue}>{stats.max}</Text>
          </View>
        </View>
        <Text style={styles.historyLabel}>
          Historique ({history.length} valeurs)
        </Text>
        <Text style={styles.historyValues} numberOfLines={2}>
          {history.join(" → ")}
        </Text>

        {/* Navigation vers l'historique */}
        <TouchableOpacity style={styles.buttonHistory} onPress={handleHistory}>
          <Text style={styles.historyText}>📋 Voir historique</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D3461",
  },
  count: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#F5A623",
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D3461",
  },
  buttonText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  buttonReset: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1D3461",
  },
  resetText: {
    fontSize: 14,
    color: "#1D3461",
  },
  stats: {
    width: "100%",
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
  statsTitle: {
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#F5A623",
  },
  historyLabel: {
    fontSize: 11,
    color: "#6B7A99",
  },
  historyValues: {
    fontSize: 11,
    color: "#2C3E6B",
    fontFamily: "Courier",
  },
  buttonHistory: {
    width: "100%",
    backgroundColor: "#1D3461",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  historyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
