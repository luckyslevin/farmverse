import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import firestore, { or } from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";

export default function OrderManagementPage() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersSnapshot = await firestore()
          .collection("orders")
          .where("storeRef", "==", firestore().collection("users").doc(currentUser.id))
          .orderBy("createdAt", "desc")
          .get();

        const groupedByCustomer = {};

        await Promise.all(
          ordersSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const customerDoc = await data.userRef.get();
            const customerData = customerDoc.data();

            const customerName = `${customerData?.firstName} ${customerData?.lastName}` || "Unknown Customer";

            if (!groupedByCustomer[customerName]) {
              groupedByCustomer[customerName] = [];
            }

            // Fetch product images for each item
            const itemsWithImages = await Promise.all(
              data.items.map(async (item) => {
                if (item.productRef) {
                  const productDoc = await item.productRef.get();
                  if (productDoc.exists) {
                    return { ...item, productImage: productDoc.data()?.imageUrl };
                  }
                }
                return { ...item };
              })
            );

            groupedByCustomer[customerName].push({
              orderId: doc.id,
              status: data.status,
              items: itemsWithImages,
              totalAmount: data.totalAmount,
              createdAt: data.createdAt.toDate(),
            });
          })
        );

        // Convert grouped orders into array format for rendering
        setGroupedOrders(
          Object.entries(groupedByCustomer).map(([customerName, orders]) => ({
            customerName,
            orders,
          }))
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser.id]);

  const handleAccept = async (orderId, customerName) => {
    try {
      // Update the order status in Firestore
      await firestore().collection("orders").doc(orderId).update({
        status: "Order Confirmed",
        "notificationSent.orderConfirmed": false,
        history: firestore.FieldValue.arrayUnion({
          status: "Order Confirmed",
          date: firestore.Timestamp.now(),
        }),
      });
  
      // Update the grouped orders state
      setGroupedOrders((prevGroupedOrders) =>
        prevGroupedOrders.map((group) =>
          group.customerName === customerName
            ? {
                ...group,
                orders: group.orders.map((order) =>
                  order.orderId === orderId
                    ? { ...order, status: "Order Confirmed" }
                    : order
                ),
              }
            : group
        )
      );
  
      // Show success toast
      Toast.show({
        type: "success",
        text1: "Order Confirmed",
        text2: `Order ID ${orderId} has been confirmed.`,
      });
    } catch (error) {
      console.error("Error accepting order:", error);
  
      // Show error toast
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to accept the order. Please try again.",
      });
    }
  };
  
  const handleReject = async (orderId, customerName) => {
    try {
      // Update the order status in Firestore
      await firestore().collection("orders").doc(orderId).update({
        status: "Canceled",
        history: firestore.FieldValue.arrayUnion({
          status: "Canceled",
          date: firestore.Timestamp.now(),
        }),
      });
  
      // Update the grouped orders state
      setGroupedOrders((prevGroupedOrders) =>
        prevGroupedOrders.map((group) =>
          group.customerName === customerName
            ? {
                ...group,
                orders: group.orders.map((order) =>
                  order.orderId === orderId
                    ? { ...order, status: "Canceled" }
                    : order
                ),
              }
            : group
        )
      );
  
      // Show success toast
      Toast.show({
        type: "success",
        text1: "Order Rejected",
        text2: `Order ID ${orderId} has been rejected.`,
      });
    } catch (error) {
      console.error("Error rejecting order:", error);
  
      // Show error toast
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject the order. Please try again.",
      });
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f4f" />
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {groupedOrders.map((group) => (
        <Card key={group.customerName} style={styles.customerCard}>
          <Card.Title title={`Customer: ${group.customerName}`} titleStyle={styles.customerName} />
          {group.orders.map((order) => (
            <Card key={order.orderId} style={styles.orderCard}>
              <Card.Title
                title={
                  <Text>
                    Order ID: <Link style={styles.orderId} href={`/orderHistory/${order.orderId}`}>{order.orderId}</Link>
                  </Text>
                }
                subtitle={`Total: ₱${order.totalAmount}`}
              />
              <Card.Content>
                {order.items.map((item, index) => (
                  <View key={`${order.orderId}-${index}`} style={styles.cardContent}>
                    <Image
                      source={{ uri: item.productImage || "https://via.placeholder.com/50" }}
                      style={styles.productImage}
                    />
                    <View style={styles.orderDetails}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productPrice}>₱{item.price}</Text>
                      <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                ))}
              </Card.Content>
              {order.status === "Order Placed" && ( // Show buttons only for "Order Placed" status
                <Card.Actions>
                  <Button
                    mode="contained"
                    onPress={() => handleAccept(order.orderId, group.customerName)}
                    style={styles.acceptButton}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleReject(order.orderId, group.customerName)}
                    style={styles.rejectButton}
                  >
                    Reject
                  </Button>
                </Card.Actions>
              )}
            </Card>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#2f4f4f",
    marginTop: 10,
  },
  customerCard: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "#f7fbe1",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  orderCard: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#eaf2d7",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f8fdd",
    textDecorationLine: "underline",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  orderDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  productPrice: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  productQuantity: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  acceptButton: {
    backgroundColor: "#2f4f4f",
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
});
