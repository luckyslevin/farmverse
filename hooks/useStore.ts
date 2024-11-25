import firestore, { FirebaseFirestoreTypes, serverTimestamp } from "@react-native-firebase/firestore";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  address: z.string().min(1),
  avatar: z.any().optional(),
  createdAt: z.date().optional()
});

export type Store = z.infer<typeof schema>;

export default function useStore(): {
  createStoreUser: UseMutationResult<void, Error, { userId: string, store: Store }, unknown>
} {

  const createStoreUser = useMutation({
    mutationFn: ({ userId, store }: { userId: string, store: Store }) => {
      const userRef = firestore().collection('users').doc(userId);
      return userRef.update({
        store: {...store, createdAt: serverTimestamp()}
      })
    }
  });
  return { createStoreUser }
}

