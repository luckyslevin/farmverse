import { useMutation } from "@tanstack/react-query";
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

  const createProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      return firestore()
      .collection("products")
      .add(product);
    }});
}