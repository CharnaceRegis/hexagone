import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'

export default function HistoryScreen() {
  // ── useLocalSearchParams — récupère les données passées en URL
  const { data } = useLocalSearchParams<{ data: string }>()

  // On parse le JSON reçu en paramètre
  const initial: number[] = data ? JSON.parse(data) : []

  // State local pour gérer la suppression
  const [history, setHistory] = useState(
    initial.map((value, index) => ({ id: String(index), value }))
  )

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const handleDeleteAll = () => {
    setHistory([])
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}

        // Header — titre + bouton tout supprimer
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {history.length} valeur{history.length > 1 ? 's' : ''}
            </Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleDeleteAll}>
                <Text style={styles.deleteAll}>Tout supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        }

        // Chaque ligne
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <View style={styles.itemIndex}>
              <Text style={styles.itemIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.itemValue}>{item.value}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        ItemSeparatorComponent={() => <View style={styles.separator} />}

        // Liste vide
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>Historique vide</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Retour au compteur</Text>
            </TouchableOpacity>
          </View>
        }
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    color: '#6B7A99',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deleteAll: {
    fontSize: 13,
    color: '#C0392B',
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1D3461',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIndexText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemValue: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5A623',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDEDEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 13,
    color: '#C0392B',
    fontWeight: 'bold',
  },
  separator: {
    height: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7A99',
  },
  backButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D3461',
  },
  backButtonText: {
    fontSize: 14,
    color: '#1D3461',
    fontWeight: '600',
  },
})
