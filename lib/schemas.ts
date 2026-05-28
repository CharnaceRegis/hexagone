/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  lib/schemas.ts — Schémas Zod (validation runtime des données)            ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  Ce fichier définit les "contrats" que les données doivent respecter,    ║
 * ║  à l'écriture comme à la lecture.                                        ║
 * ║                                                                          ║
 * ║  TypeScript seul ne vérifie les types qu'à la COMPILATION. Au RUNTIME,   ║
 * ║  n'importe quoi peut sortir de Firestore (le bol est schemaless). Zod    ║
 * ║  ajoute une vérification au runtime : si la donnée n'est pas conforme,   ║
 * ║  on le sait IMMÉDIATEMENT, avec un message d'erreur explicite, plutôt    ║
 * ║  que de planter 3 écrans plus loin avec une erreur cryptique.            ║
 * ║                                                                          ║
 * ║  3 schémas pour 3 usages :                                               ║
 * ║                                                                          ║
 * ║    CreateSessionInputSchema  → ce qu'on envoie à Firestore (écriture)    ║
 * ║    FirestoreSessionDataSchema → ce qu'on lit de Firestore (Timestamp)    ║
 * ║    SessionSchema             → la Session utilisée côté app (Date)       ║
 * ║                                                                          ║
 * ║  Les types TypeScript sont DÉRIVÉS des schémas via z.infer.              ║
 * ║  → Une seule source de vérité : le schéma. Si tu changes le schéma,      ║
 * ║    le type TS suit automatiquement.                                      ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { Timestamp } from "firebase/firestore";
import { z } from "zod";

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  Champs communs                                                        ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Les 4 champs métier d'une session, qu'on retrouve partout (input + lecture).
 * On les définit une fois et on les compose dans les autres schémas.
 */
const sessionMetricsShape = {
  values: z.array(z.number()),
  min: z.number(),
  avg: z.number(),
  max: z.number(),
};

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  Schéma d'entrée — ce qu'on envoie à Firestore                         ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Validation à l'écriture (createSession).
 * Pas d'id (Firestore le génère) ni de createdAt (on utilise serverTimestamp).
 */
export const CreateSessionInputSchema = z.object(sessionMetricsShape);

export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  Schéma de lecture brute — ce qu'on reçoit de Firestore                ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * Validation à la lecture, AVANT conversion Timestamp → Date.
 *
 * `createdAt` est un `Timestamp` (la classe Firestore) ou `null` :
 *  - Timestamp : cas normal, le serveur a renvoyé l'heure d'écriture.
 *  - null : cas transitoire juste après un addDoc avec serverTimestamp(),
 *    le temps que le serveur confirme. Quelques millisecondes en général.
 *
 * On utilise z.instanceof(Timestamp) parce que ce n'est pas un type
 * JavaScript primitif, c'est une classe importée de firebase/firestore.
 */
export const FirestoreSessionDataSchema = z.object({
  ...sessionMetricsShape,
  createdAt: z.instanceof(Timestamp).nullable(),
});

// ╔════════════════════════════════════════════════════════════════════════╗
// ║  Schéma final — la Session telle que l'app la consomme                 ║
// ╚════════════════════════════════════════════════════════════════════════╝

/**
 * La Session après conversion : `createdAt` est devenu un `Date` JS.
 * On ajoute aussi `id` qui n'existe pas dans le document Firestore
 * (Firestore le stocke séparément).
 *
 * Le type `Session` exporté est dérivé de ce schéma via z.infer.
 * → Si tu ajoutes un champ ici, TypeScript le voit partout dans l'app.
 */
export const SessionSchema = z.object({
  id: z.string(),
  ...sessionMetricsShape,
  createdAt: z.date().nullable(),
});

export type Session = z.infer<typeof SessionSchema>;
