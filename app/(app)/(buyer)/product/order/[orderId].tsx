import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";

export default function OrderTrackingPage() {
  const { orderId } = useLocalSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderDoc = await firestore()
          .collection("orders")
          .doc(orderId)
          .get();

        if (orderDoc.exists) {
          const data = orderDoc.data();

          // Fetch product details for items
          const itemsWithDetails = await Promise.all(
            data.items.map(async (item) => {
              const productDoc = await item.productRef.get();
              return {
                ...item,
                name: productDoc.data()?.name || "Unknown Product",
                imageUrl:
                  productDoc.data()?.imageUrl ||
                  "https://via.placeholder.com/100",
              };
            })
          );

          setOrderData({ ...data, items: itemsWithDetails });

          // Fetch user details using userRef
          const userDoc = await data.userRef.get();
          if (userDoc.exists) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await firestore().collection("orders").doc(orderId).update({
                status: "Canceled",
                history: firestore.FieldValue.arrayUnion({
                  status: "Canceled",
                  date: firestore.Timestamp.now(),
                }),
              });
              setOrderData((prevData) => ({
                ...prevData,
                status: "Canceled",
                history: [
                  ...prevData.history,
                  { status: "Canceled", date: firestore.Timestamp.now() },
                ],
              }));

              Alert.alert("Success", "Your order has been canceled.");
            } catch (error) {
              console.error("Error canceling the order:", error);
              Alert.alert("Error", "Failed to cancel the order. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading || !orderData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f4f" />
        <Text style={styles.loadingText}>Loading Order Details...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: "Order Details", headerRight: () => <Header /> }}
      />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.thankYouText}>Thanks for your Order</Text>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          {orderData.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₱{item.price}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Order Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.statusHeader}>Order Status</Text>
          <Text style={styles.orderId}>Order ID - {orderId}</Text>
          <View style={styles.timeline}>
            {orderData.history
              .sort((a, b) => b.date.toDate() - a.date.toDate())
              .map((historyItem, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    {index <= orderData.history.length - 1 && (
                      <View style={styles.timelineCompleted} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStatus}>
                      {historyItem.status}
                    </Text>
                    <Text style={styles.timelineDate}>
                      {historyItem.date.toDate().toLocaleDateString()}{" "}
                      {historyItem.date.toDate().toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.addressHeader}>Delivery Address</Text>
          <Text style={styles.addressText}>
            {userData?.firstName + " " + userData?.lastName || "Unknown Customer"}
          </Text>
          <Text style={styles.addressText}>{userData?.address || "N/A"}</Text>
          <Text style={styles.addressText}>
            Mobile: {userData?.phoneNo || "N/A"}
          </Text>
        </View>

        {/* Cancel Order and Back to Home Buttons */}
        {orderData.status === "Order Placed" && (
          <Button
            mode="contained"
            onPress={handleCancelOrder}
            style={styles.cancelButton}
          >
            Cancel Order
          </Button>
        )}
        <Button
          mode="contained"
          onPress={() => router.push("/(buyer)/product")}
          style={styles.backButton}
        >
          Back to Home
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f7fbe1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#2f4f4f",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
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
  itemQty: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  statusSection: {
    marginBottom: 20,
  },
  statusHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    color: "#4f4f4f",
    marginBottom: 10,
  },
  timeline: {
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#D3D3D3",
  },
  timelineItem: {
    marginBottom: 20,
    flexDirection: "row",
  },
  timelineMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D3D3D3",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineCompleted: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  timelineContent: {
    marginLeft: 10,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  timelineDate: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  addressSection: {
    marginBottom: 20,
  },
  addressHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  backButton: {
    borderRadius: 20,
    padding: 10,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
});