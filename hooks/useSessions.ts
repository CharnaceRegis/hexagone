import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSession,
  deleteSession,
  getSession,
  getSessions,
  type CreateSessionInput,
} from "../lib/sessions";

// ── Clés de cache ─────────────────────────────────────────
// Centraliser les queryKeys évite les fautes de frappe.
export const sessionsKeys = {
  all: ["sessions"] as const,
  detail: (id: string) => ["sessions", id] as const,
};

// ── Liste de toutes les sessions ──────────────────────────
export function useSessions() {
  return useQuery({
    queryKey: sessionsKeys.all,
    queryFn: getSessions,
  });
}

// ── Détail d'une session ──────────────────────────────────
export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: sessionsKeys.detail(id ?? ""),
    queryFn: () => getSession(id as string),
    enabled: !!id, // n'exécute pas la query tant que l'id n'est pas défini
  });
}

// ── Création d'une session ────────────────────────────────
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(input),
    onSuccess: () => {
      // Invalide la liste pour qu'elle se re-fetche au prochain affichage
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}

// ── Suppression d'une session ─────────────────────────────
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
    },
  });
}
