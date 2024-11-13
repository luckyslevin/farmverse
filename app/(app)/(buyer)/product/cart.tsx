// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import {
//   Checkbox,
//   Card,
//   Text,
//   IconButton,
//   Button,
//   Divider,
// } from "react-native-paper";
// import firestore from "@react-native-firebase/firestore";
// import { useAtomValue } from "jotai";
// import { userAtom } from "@/stores/user";

// export default function CartPage() {
//   const [cartData, setCartData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const currentUser = useAtomValue(userAtom);
//   useEffect(() => {
//     const fetchCartData = async () => {
//       try {
//         setLoading(true);
//         const cartSnapshot = await firestore()
//           .collection("users")
//           .doc(currentUser.id)
//           .collection("carts")
//           .get();

//         const fetchedCartData = await Promise.all(
//           cartSnapshot.docs.map(async (doc) => {
//             const cartItemData = doc.data();
//             const productDoc = await cartItemData.productRef.get();
//             const product = productDoc.data();

//             const storeDoc = await product.userRef.get();
//             const storeData = storeDoc.data();

//             return {
//               id: doc.id,
//               quantity: cartItemData.quantity,
//               product,
//               user: storeData,
//             };
//           })
//         );
//         console.log(fetchedCartData)
//         setCartData(fetchedCartData);
//       } catch (error) {
//         console.error("Error fetching cart data:", error);
//         // Alert.alert("Error", "Could not fetch cart data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartData();
//   }, []);

//   // const handleQuantityChange = async (itemId, increment) => {
//     // const itemIndex = cartData.findIndex((item) => item.id === itemId);
//     // if (itemIndex === -1) return;

//     // const updatedCartData = [...cartData];
//     // const item = updatedCartData[itemIndex];
//     // const newQuantity = Math.max(1, item.quantity + increment);

//     // // Update the quantity in Firestore
//     // await firestore()
//     //   .collection("users")
//     //   .doc(currentUser.id)
//     //   .collection("carts")
//     //   .doc(itemId)
//     //   .update({ quantity: newQuantity });

//     // item.quantity = newQuantity;
//     // setCartData(updatedCartData);
//   // };
//   const handleQuantityChange = async (itemId, increment) => {
//     const itemIndex = cartData.findIndex((item) => item.id === itemId);
//     if (itemIndex === -1) return;
  
//     const updatedCartData = [...cartData];
//     const item = updatedCartData[itemIndex];
//     const newQuantity = item.quantity + increment;
  
//     if (newQuantity <= 0) {
//       // Remove item from Firestore if quantity is 0
//       await firestore()
//         .collection('users')
//         .doc(currentUser.id)
//         .collection('carts')
//         .doc(itemId)
//         .delete();
  
//       // Remove item from cartData state
//       updatedCartData.splice(itemIndex, 1);
//     } else {
//       // Update quantity in Firestore
//       await firestore()
//         .collection('users')
//         .doc(currentUser.id)
//         .collection('carts')
//         .doc(itemId)
//         .update({ quantity: newQuantity });
  
//       // Update quantity in cartData state
//       item.quantity = newQuantity;
//     }
  
//     setCartData(updatedCartData);
//   };

//   if (loading) {
//     return (
//       <ActivityIndicator
//         size="large"
//         color="#0000ff"
//         style={{ flex: 1, justifyContent: "center" }}
//       />
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>My Cart</Text>

//       {cartData.map((item) => (
//         <View key={item.id}>
//           <View style={styles.storeHeader}>
//             <Checkbox status="unchecked" />
//             <Text style={styles.storeName}>{item.user.store.name}</Text>
//           </View>
//           <Divider />
//           <Card style={styles.cartItem}>
//             <View style={styles.itemHeader}>
//               <Checkbox status="unchecked" />
//               <Text style={styles.itemName}>{item.product.name}</Text>
//               <IconButton icon="dots-vertical" />
//             </View>
//             <View style={styles.itemDetails}>
//               <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
//               <View style={styles.infoContainer}>
//                 <Text style={styles.itemPrice}>₱{item.product.price}</Text>
//                 <View style={styles.quantityContainer}>
//                   <IconButton
//                     icon="minus"
//                     onPress={() => handleQuantityChange(item.id, -1)}
//                     style={styles.quantityButton}
//                   />
//                   <Text style={styles.quantityText}>{item.quantity}</Text>
//                   <IconButton
//                     icon="plus"
//                     onPress={() => handleQuantityChange(item.id, 1)}
//                     style={styles.quantityButton}
//                   />
//                 </View>
//               </View>
//             </View>
//           </Card>
//         </View>
//       ))}

//       {/* Footer Section */}
//       <View style={styles.footer}>
//         <Checkbox status="unchecked" />
//         <Text>Total: ₱{cartData.reduce((total, item) => total + item.product.price * item.quantity, 0)}</Text>
//         <Button mode="contained" style={styles.checkoutButton}>
//           Check Out
//         </Button>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#eaf2d7',
//     padding: 10,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     // color: '#2f4f4f',
//     marginVertical: 10,
//     textAlign: 'center',
//   },
//   storeHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//   },
//   storeName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 8,
//     // color: '#2f4f4f',
//   },
//   cartItem: {
//     // backgroundColor: '#d9e4d3',
//     marginVertical: 5,
//     borderRadius: 8,
//     padding: 10,
//   },
//   itemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     // color: '#2f4f4f',
//     flex: 1,
//   },
//   itemDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//   },
//   infoContainer: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   itemPrice: {
//     fontSize: 16,
//     // color: '#4f4f4f',
//     marginBottom: 5,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   quantityButton: {
//     // backgroundColor: '#4f4f4f',
//   },
//   quantityText: {
//     fontSize: 16,
//     paddingHorizontal: 10,
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 20,
//     paddingHorizontal: 10,
//     // backgroundColor: '#2f4f4f',
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   checkoutButton: {
//     // backgroundColor: '#4f4f4f',
//     borderRadius: 20,
//     paddingHorizontal: 20,
//   },
// });


import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Checkbox, Card, Text, IconButton, Button, Divider } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

export default function CartPage() {
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cartSnapshot = await firestore()
          .collection("users")
          .doc(currentUser.id)
          .collection("carts")
          .get();

        const fetchedCartData = {};

        await Promise.all(
          cartSnapshot.docs.map(async (doc) => {
            const cartItemData = doc.data();
            const productDoc = await cartItemData.productRef.get();
            const product = productDoc.data();

            const storeDoc = await product.userRef.get();
            const storeData = storeDoc.data();

            const storeName = storeData.store.name;
            console.log(storeName)
            // Group items by store
            if (!fetchedCartData[storeName]) {
              fetchedCartData[storeName] = {
                store: storeData,
                items: []
              };
            }

            fetchedCartData[storeName].items.push({
              id: doc.id,
              quantity: cartItemData.quantity,
              product,
              user: storeData,
            });
          })
        );
        console.log(fetchedCartData)
        setCartData(Object.values(fetchedCartData)); // Convert object to array for rendering
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleQuantityChange = async (storeName, itemId, increment) => {
    const updatedCartData = [...cartData];
    console.log("ddd", updatedCartData, storeName)
    const storeIndex = updatedCartData.findIndex((cart) => cart.store.store?.name === storeName);
    console.log(storeIndex)
    if (storeIndex === -1) return;

    const itemIndex = updatedCartData[storeIndex].items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return;

    const item = updatedCartData[storeIndex].items[itemIndex];
    const newQuantity = item.quantity + increment;

    if (newQuantity <= 0) {
      // Remove item from Firestore if quantity is 0
      await firestore()
        .collection("users")
        .doc(currentUser.id)
        .collection("carts")
        .doc(itemId)
        .delete();

      // Remove item from cartData state
      updatedCartData[storeIndex].items.splice(itemIndex, 1);
      // Remove the store group if no items left
      if (updatedCartData[storeIndex].items.length === 0) {
        updatedCartData.splice(storeIndex, 1);
      }
    } else {
      // Update quantity in Firestore
      await firestore()
        .collection("users")
        .doc(currentUser.id)
        .collection("carts")
        .doc(itemId)
        .update({ quantity: newQuantity });

      // Update quantity in cartData state
      item.quantity = newQuantity;
    }

    setCartData(updatedCartData);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Cart</Text>

      {cartData.map((storeGroup) => (
        <View key={storeGroup.store.store.name}>
          <View style={styles.storeHeader}>
            <Checkbox status="unchecked" />
            <Text style={styles.storeName}>{storeGroup?.store?.store?.name ?? 'Na'}</Text>
          </View>
          <Divider />
          {storeGroup.items.map((item) => (
            <Card key={item.id} style={styles.cartItem}>
              <View style={styles.itemHeader}>
                <Checkbox status="unchecked" />
                <Text style={styles.itemName}>{item.product.name}</Text>
                <IconButton icon="dots-vertical" />
              </View>
              <View style={styles.itemDetails}>
                <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
                <View style={styles.infoContainer}>
                  <Text style={styles.itemPrice}>₱{item.product.price}</Text>
                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      onPress={() => handleQuantityChange(storeGroup?.store?.store?.name, item.id, -1)}
                      style={styles.quantityButton}
                    />
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      onPress={() => handleQuantityChange(storeGroup?.store?.store?.name, item.id, 1)}
                      style={styles.quantityButton}
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ))}

      {/* Footer Section */}
      <View style={styles.footer}>
        <Checkbox status="unchecked" />
        <Text>Total: ₱{cartData.reduce((total, storeGroup) => total + storeGroup.items.reduce((storeTotal, item) => storeTotal + item.product.price * item.quantity, 0), 0)}</Text>
        <Button mode="contained" style={styles.checkoutButton}>
          Check Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cartItem: {
    marginVertical: 5,
    borderRadius: 8,
    padding: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  itemPrice: {
    fontSize: 16,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  checkoutButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
  },
});
