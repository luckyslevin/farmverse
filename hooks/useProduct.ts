import { useMutation, useQuery } from "@tanstack/react-query";
import firestore from "@react-native-firebase/firestore";
import { z } from "zod";


const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number(),
  cateogry: z.any(),
});

type Product = z.infer<typeof schema>;

export function useProduct() {

  const createProduct = useMutation({
    mutationFn: ({ userId, product }) => {
      const userRef = firestore().collection('users').doc(userId);
      return firestore().collection('products').add({
        ...product,
        userRef,
      });
    }
  });
}