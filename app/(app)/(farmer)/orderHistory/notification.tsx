import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";
import { Stack, router } from "expo-router";
import Header from "@/components/Header";
import { Card, Text, ActivityIndicator } from "react-native-paper";

export default function FarmersNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Fetch orders for the farmer (based on storeRef)
        const ordersSnapshot = await firestore()
          .collection("orders")
          .where(
            "storeRef",
            "==",
            firestore().collection("users").doc(currentUser.id)
          )
          .orderBy("createdAt", "desc")
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

            // Fetch customer information
            const customer = await order.userRef.get();
            const customerData = customer.data();

            return {
              id: doc.id,
              orderId: order.orderId,
              customerName: `${customerData.firstName} ${customerData.lastName}`,
              status: order.status || "No Status",
              date: order.createdAt.toDate().toLocaleString(),
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
                  uri: notification.image || "https://via.placeholder.com/50",
                }}
                style={styles.notificationImage}
              />
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>
                  New Order Received!
                </Text>
                <Text style={styles.notificationMessage}>
                  Order ID: <Text style={styles.orderIdText}>{notification.id}</Text>{" "}
                  has been placed by <Text style={styles.customerName}>{notification.customerName}</Text>.{" "}
                  Please review and prepare the order for processing.
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
    backgroundColor: "#ffffff",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#dcdcdc",
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
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4f4f4f",
    marginVertical: 4,
    lineHeight: 20,
  },
  orderIdText: {
    fontWeight: "bold",
    color: "#2f8fdd",
  },
  customerName: {
    fontWeight: "bold",
    color: "#4caf50",
  },
  notificationDate: {
    fontSize: 12,
    color: "#7d7d7d",
    marginTop: 4,
  },
});
