import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";

export default function OrderTrackingPage() {
  const { orderId } = useLocalSearchParams();
  const [orderData, setOrderData] = useState(null);
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
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
          {/* <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          style={styles.headerIcon}
        /> */}
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
              .sort((a, b) => b.date.toDate() - a.date.toDate()) // Sort in ascending order
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
          {/* <View style={styles.timeline}>
          {orderData.history.map((historyItem, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineMarker}>
                {index <= orderData.history.length - 1 && (
                  <View style={styles.timelineCompleted} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{historyItem.status}</Text>
                <Text style={styles.timelineDate}>
                  {historyItem.date.toDate().toLocaleDateString()}{" "}
                  {historyItem.date.toDate().toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </View> */}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressHeader}>Delivery Address</Text>
          <Text style={styles.addressText}>Store: {orderData.storeName}</Text>
          <Text style={styles.addressText}>
            Total Amount: ₱{orderData.totalAmount}
          </Text>
        </View>

        {/* Back to Home Button */}
        <Button mode="contained" onPress={() => {}} style={styles.backButton}>
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
  headerIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: "bold",
    // color: "#4CAF50",
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
    // backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 10,
  },
});
