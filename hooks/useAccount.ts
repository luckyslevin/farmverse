import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useMutation, UseMutationResult } from '@tanstack/react-query';


export function useAccount(): {
  createAccountMutation: UseMutationResult<FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>, Error, {
    email: string;
    firstName: string;
    lastName: string;
    phoneNo: string;
  }, unknown>
} {

  const createAccountMutation = useMutation({
    mutationFn: ({ email, firstName, lastName, phoneNo }: { email: string, firstName: string, lastName: string, phoneNo: string }) => {
      return firestore().collection('users').add({
        email,
        firstName,
        lastName,
        phoneNo,
      })
    }
  });
  return { createAccountMutation }
}