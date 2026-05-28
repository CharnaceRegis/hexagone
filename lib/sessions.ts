/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  lib/sessions.ts — Point de contact unique avec la collection "sessions" ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  Ce fichier centralise TOUTES les interactions avec la collection        ║
 * ║  Firestore "sessions". Le reste de l'app ne devrait jamais appeler       ║
 * ║  directement `addDoc`, `getDocs` ou `deleteDoc` — il passe par les       ║
 * ║  fonctions exportées ici.                                                ║
 * ║                                                                          ║
 * ║  ➜ Les SCHÉMAS de validation Zod sont dans `lib/schemas.ts`.             ║
 * ║    Ce fichier-ci s'occupe seulement des appels Firestore et de la        ║
 * ║    conversion (Timestamp → Date) après validation.                       ║
 * ║                                                                          ║
 * ║  Rappel : Firestore est "schemaless".                                    ║
 * ║  La collection "sessions" n'est définie nulle part dans Firebase.        ║
 * ║  Elle est créée automatiquement au premier `addDoc`. Le nom de la        ║
 * ║  collection ("sessions") est juste une string dans notre code.           ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import {
  CreateSessionInputSchema,
  FirestoreSessionDataSchema,
  type CreateSessionInput,
  type Session,
} from "./schemas";

// On réexporte les types pour que les consommateurs n'aient qu'un point
// d'import (`lib/sessions`).
export type { CreateSessionInput, Session };

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  RÉFÉRENCE À LA COLLECTION                                             ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * `collection(db, "sessions")` crée une référence vers la collection
 * "sessions" de Firestore. C'est juste un POINTEUR — aucun appel réseau
 * n'a lieu ici. La collection n'existe pas tant qu'on n'a pas écrit
 * son premier document via `addDoc`.
 */
const sessionsRef = collection(db, "sessions");

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  HELPER : Conversion document Firestore → Session                      ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Adaptateur entre la donnée brute Firestore et notre type `Session`.
 *
 * On utilise `safeParse` (et non `parse`) pour que UN document corrompu
 * ne fasse pas planter TOUTE la liste. À la place, on logue un warning
 * explicite et on retourne `null` — le document est filtré dans
 * `getSessions`.
 *
 * Pour `getSession` (lecture d'UN document précis), on lève par contre
 * une erreur, parce que l'utilisateur a explicitement demandé CE document
 * et on ne peut pas le servir.
 *
 * @returns Session si valide, null sinon
 */
function docToSession(id: string, data: unknown): Session | null {
  const result = FirestoreSessionDataSchema.safeParse(data);

  if (!result.success) {
    console.warn(
      `[sessions] Document ${id} invalide, ignoré :`,
      result.error.issues,
    );
    return null;
  }

  // Conversion Timestamp → Date (seul travail restant après validation)
  return {
    id,
    values: result.data.values,
    min: result.data.min,
    avg: result.data.avg,
    max: result.data.max,
    createdAt: result.data.createdAt ? result.data.createdAt.toDate() : null,
  };
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  CREATE — Ajouter une nouvelle session                                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Crée un nouveau document dans la collection "sessions".
 *
 * Étapes :
 *  1. Validation de l'input avec Zod (`.parse` → throw si invalide)
 *  2. Envoi à Firestore via `addDoc`, avec `serverTimestamp()` pour la date
 *  3. Retour de l'id généré par Firestore
 *
 * Pourquoi valider l'input alors que TypeScript le type déjà ?
 * → TypeScript ne vérifie qu'à la COMPILATION. Si la donnée vient d'une
 *   source non typée (formulaire, json mal formé, etc.), TypeScript peut
 *   être trompé. Zod ferme cette porte au runtime.
 *
 * @throws ZodError si l'input n'est pas conforme
 * @returns L'id Firestore du document créé
 */
export async function createSession(
  input: CreateSessionInput,
): Promise<string> {
  // Validation runtime : si quoi que ce soit cloche, on échoue AVANT
  // d'envoyer quoi que ce soit à Firestore.
  const validated = CreateSessionInputSchema.parse(input);

  const docRef = await addDoc(sessionsRef, {
    ...validated,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  READ all — Lister toutes les sessions                                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Récupère toutes les sessions, triées de la plus récente à la plus ancienne.
 *
 * Tolérance : les documents qui ne passent pas la validation Zod sont
 * IGNORÉS (avec un warning console), pas un crash global. L'app continue
 * à afficher les sessions valides.
 */
export async function getSessions(): Promise<Session[]> {
  const q = query(sessionsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => docToSession(d.id, d.data()))
    .filter((s): s is Session => s !== null);
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  READ one — Récupérer une session par son id                           ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Récupère UNE session précise via son id Firestore.
 *
 * Contrairement à `getSessions`, on lève une erreur si la validation
 * échoue : l'utilisateur a demandé CE document, on ne peut pas le
 * remplacer silencieusement par null.
 *
 * @throws Error si la session n'existe pas
 * @throws Error si la donnée est corrompue (validation Zod échoue)
 */
export async function getSession(id: string): Promise<Session> {
  const snap = await getDoc(doc(db, "sessions", id));
  if (!snap.exists()) {
    throw new Error("Session introuvable");
  }

  const session = docToSession(snap.id, snap.data());
  if (!session) {
    throw new Error("Session corrompue : la donnée Firestore est invalide");
  }
  return session;
}

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  DELETE — Supprimer une session                                        ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Supprime définitivement le document de la collection "sessions".
 *
 * ⚠️ Cette opération est IRRÉVERSIBLE côté Firestore. On affiche donc
 * une confirmation native (Alert.alert) avant de l'appeler dans
 * app/[id].tsx.
 */
export async function deleteSession(id: string): Promise<void> {
  console.log("delteSession", id);
  await deleteDoc(doc(db, "sessions", id));
}
