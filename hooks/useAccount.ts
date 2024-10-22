import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';

export let schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNo: z.string().refine((value) => /^(?:[0-9-()/.]\s?){6,15}[0-9]{1}$/.test(value)),
  password: z.string().min(1),
  type: z.enum(["User", "Farmer"]).optional(),
})
export type Account = z.infer<typeof schema>
export function useAccount(): {
  createAccountMutation: UseMutationResult<void, Error, Account, unknown>
} {

  const createAccountMutation = useMutation({
    mutationFn: async (account: Account) =>{
      const { user } = await auth().createUserWithEmailAndPassword(account.email, account.password)
      
      return firestore().collection('users')
      .doc(user.uid)
      .set({
        id: user.uid,
        ...account,
      })
    }
  });

  return { createAccountMutation }
}