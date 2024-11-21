import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";
import Header from "@/components/Header";

export default function CheckoutPage() {
  const { selectedCart } = useLocalSearchParams();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchCheckoutItems = async () => {
      try {
        const parsedSelectedCart = JSON.parse(selectedCart || "[]");
        const groupedItems = {};

        for (const { storeName, itemId } of parsedSelectedCart) {
          const cartDoc = await firestore()
            .collection("users")
            .doc(currentUser.id)
            .collection("carts")
            .doc(itemId)
            .get();

          if (cartDoc.exists) {
            const cartData = cartDoc.data();

            if (!cartData.productRef) {
              console.error(`Missing productRef for cart item ID: ${itemId}`);
              continue; // Skip this item if productRef is missing
            }

            const productDoc = await cartData.productRef.get();
            const productData = productDoc.data();

            if (!groupedItems[storeName]) {
              groupedItems[storeName] = {
                items: [],
                userRef: productData.userRef, // Include userRef for the store
              };
            }

            groupedItems[storeName].items.push({
              ...productData,
              productRef: cartData.productRef, // Include the productRef
              quantity: cartData.quantity,
              itemId,
            });
          }
        }

        setCheckoutItems(
          Object.entries(groupedItems).map(([storeName, data]) => ({
            storeName,
            userRef: data.userRef,
            items: data.items,
          }))
        );
      } catch (error) {
        console.error("Error fetching checkout items:", error);
      } finally {
        setLoading(false);
      }
    };
    // const fetchCheckoutItems = async () => {
    //   try {
    //     const parsedSelectedCart = JSON.parse(selectedCart || "[]");
    //     const groupedItems = {};

    //     for (const { storeName, itemId } of parsedSelectedCart) {
    //       const cartDoc = await firestore()
    //         .collection("users")
    //         .doc(currentUser.id)
    //         .collection("carts")
    //         .doc(itemId)
    //         .get();

    //       if (cartDoc.exists) {
    //         const cartData = cartDoc.data();
    //         const productDoc = await cartData.productRef.get();
    //         const productData = productDoc.data();
    //         console.log("productData", productData)
    //         if (!groupedItems[storeName]) {
    //           groupedItems[storeName] = {
    //             items: [],
    //             userRef: productData.userRef, // Include userRef for the store
    //           };
    //         }

    //         groupedItems[storeName].items.push({
    //           ...productData,
    //           quantity: cartData.quantity,
    //           itemId,
    //         });
    //       }
    //     }

    //     setCheckoutItems(
    //       Object.entries(groupedItems).map(([storeName, data]) => ({
    //         storeName,
    //         userRef: data.userRef,
    //         items: data.items,
    //       }))
    //     );
    //   } catch (error) {
    //     console.error("Error fetching checkout items:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchCheckoutItems();
  }, [selectedCart]);

  const calculateTotal = () => {
    return checkoutItems.reduce((total, storeGroup) => {
      return (
        total +
        storeGroup.items.reduce(
          (storeTotal, item) => storeTotal + item.price * item.quantity,
          0
        )
      );
    }, 0);
  };

  // const handlePlaceOrder = async () => {
  //   try {
  //     const ordersRef = firestore().collection("orders");
  
  //     for (const storeGroup of checkoutItems) {
  //       const orderItems = storeGroup.items.map((item) => ({
  //         name: item.name,
  //         price: item.price,
  //         quantity: item.quantity,
  //         productId: item.itemId,
  //         productRef: item.productRef,
  //       }));
  
  //       // Create order data without history timestamp
  //       const orderData = {
  //         userRef: firestore().collection("users").doc(currentUser.id),
  //         storeName: storeGroup.storeName,
  //         storeRef: storeGroup.userRef, // Include userRef for the store
  //         items: orderItems,
  //         totalAmount: orderItems.reduce(
  //           (total, item) => total + item.price * item.quantity,
  //           0
  //         ),
  //         createdAt: firestore.FieldValue.serverTimestamp(), // Add the timestamp here
  //         status: "Order Placed",
  //         history: [], // Initialize as an empty array
  //       };
  
  //       console.log("orderData", orderData);
  
  //       // Add the order to the collection and get its reference
  //       const orderDocRef = await ordersRef.add(orderData);
  
  //       // Add the history entry with a separate update
  //       await orderDocRef.update({
  //         history: firestore.FieldValue.arrayUnion({
  //           status: "Order Placed",
  //           timestamp: firestore.FieldValue.serverTimestamp(),
  //         }),
  //       });
  
  //       console.log("Order successfully added with ID:", orderDocRef.id);
  //     }
  
  //     // Clear the selected cart items after order placement
  //     const parsedSelectedCart = JSON.parse(selectedCart || "[]");
  //     for (const { itemId } of parsedSelectedCart) {
  //       await firestore()
  //         .collection("users")
  //         .doc(currentUser.id)
  //         .collection("carts")
  //         .doc(itemId)
  //         .delete();
  //     }
  
  //     Alert.alert("Order Placed", "Your order has been placed successfully!");
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     Alert.alert("Error", "Failed to place your order. Please try again.");
  //   }
  // };
  const handlePlaceOrder = async () => {
    try {
      const ordersRef = firestore().collection("orders");
  
      for (const storeGroup of checkoutItems) {
        const orderItems = storeGroup.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId: item.itemId,
          productRef: item.productRef,
        }));
  
        // Step 1: Add the order without history
        const orderDocRef = await ordersRef.add({
          userRef: firestore().collection("users").doc(currentUser.id),
          storeName: storeGroup.storeName,
          storeRef: storeGroup.userRef,
          items: orderItems,
          totalAmount: orderItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          ),
          createdAt: firestore.FieldValue.serverTimestamp(), // Directly used in Firestore add()
          status: "Order Placed",
          history: [], // Initially empty
        });
  
        // Step 2: Update the history field
        await orderDocRef.update({
          history: firestore.FieldValue.arrayUnion({
            status: "Order Placed",
            date: firestore.Timestamp.now(), // Used directly inside update()
          }),
        });
  
        console.log("Order placed successfully:", orderDocRef.id);
      }
  
      // Clear the selected cart items after order placement
      const parsedSelectedCart = JSON.parse(selectedCart || "[]");
      for (const { itemId } of parsedSelectedCart) {
        await firestore()
          .collection("users")
          .doc(currentUser.id)
          .collection("carts")
          .doc(itemId)
          .delete();
      }
  
      Alert.alert("Order Placed", "Your order has been placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place your order. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Stack.Screen
          options={{ title: "Checkout", headerRight: () => <Header /> }}
        />
        {checkoutItems.map((storeGroup) => (
          <View key={storeGroup.storeName} style={styles.storeContainer}>
            <Text style={styles.storeName}>{storeGroup.storeName}</Text>
            {storeGroup.items.map((item) => (
              <View key={item.itemId} style={styles.itemContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₱{item.price}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <Divider style={styles.divider} />

        {/* Price Details */}
        <View style={styles.priceDetails}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Price ({checkoutItems.length} item)
            </Text>
            <Text style={styles.priceValue}>₱{calculateTotal()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>Info</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱{calculateTotal()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          Place Order
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf2d7",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storeContainer: {
    marginBottom: 20,
    backgroundColor: "#f7fbe1",
    padding: 10,
    borderRadius: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2f4f4f",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  itemPrice: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#4f4f4f",
    marginBottom: 5,
  },
  divider: {
    backgroundColor: "#d4e1c7",
    marginVertical: 10,
  },
  priceDetails: {
    padding: 10,
    backgroundColor: "#f7fbe1",
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  footer: {
    padding: 10,
    backgroundColor: "#f7fbe1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: "#d4e1c7",
    borderWidth: 1,
  },
  placeOrderButton: {
    borderRadius: 20,
    // backgroundColor: "#4CAF50",
  },
});
