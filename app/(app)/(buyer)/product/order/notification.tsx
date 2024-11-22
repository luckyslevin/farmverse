import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";
import { Stack, Link, router } from "expo-router";
import Header from "@/components/Header";
import { Card, Text, ActivityIndicator } from "react-native-paper";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Fetch orders from Firestore where the user is the customer
        const ordersSnapshot = await firestore()
          .collection("orders")
          .where(
            "userRef",
            "==",
            firestore().collection("users").doc(currentUser.id)
          )
          .orderBy("createdAt", "asc")
          .get();

        const notificationsData = await Promise.all(
          ordersSnapshot.docs.map(async (doc) => {
            const order = doc.data();
            const items = order.items || [];

            // Fetch product image for the first item (if available)
            const productImage =
              items.length > 0 && items[0].productRef
                ? (await items[0].productRef.get()).data()?.imageUrl
                : null;

            // Get the latest entry in the history array
            const historyEntries = order.history || [];
            const latestHistory = historyEntries.sort(
              (a, b) => b.date.toDate() - a.date.toDate()
            )[0];

            return {
              id: doc.id, // Order ID
              orderId: order.orderId,
              storeName: order.storeName,
              status: latestHistory?.status || "No Status",
              date:
                latestHistory?.date.toDate().toLocaleString() || "Unknown Date", // Convert Firestore timestamp to formatted string
              image: productImage, // First product image
            };
          })
        );

        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f4f4f" />
        <Text style={styles.loadingText}>Loading Notifications...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: "Notifications", headerRight: () => <Header /> }}
      />

      <ScrollView style={styles.container}>
        {notifications.map((notification, index) => (
          <Card
            key={index}
            style={styles.notificationCard}
            onPress={() => {
              // Navigate to the order details page
              router.push(`/product/order/${notification.id}`);
            }}
            mode="contained"
          >
            <Card.Content style={styles.cardContent}>
              <Image
                source={{
                  uri: notification.image || "https://via.placeholder.com/50", // Placeholder if no image available
                }}
                style={styles.notificationImage}
              />
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>
                  {notification.status}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.status === "Order Placed"
                    ? `Your order `
                    : `Your order `}
                  <Text style={styles.orderIdText}>{notification.id}</Text>
                  {notification.status === "Order Placed"
                    ? ` is now pending with ${notification.storeName}.`
                    : ` status updated to "${notification.status}".`}
                </Text>
                <Text style={styles.notificationDate}>{notification.date}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
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
    color: "#4f4f4f",
  },
  notificationCard: {
    marginBottom: 10,
    borderRadius: 8,
    // backgroundColor: "#ffffff",
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4f4f4f",
    marginVertical: 4,
  },
  orderIdText: {
    fontSize: 14,
    color: "#2f8fdd",
    textDecorationLine: "underline",
  },
  notificationDate: {
    fontSize: 12,
    color: "#7d7d7d",
  },
});