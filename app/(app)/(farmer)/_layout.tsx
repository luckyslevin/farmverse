import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import { userAtom } from "@/stores/user";
import Header from "@/components/Header";

export default function Layout() {
  const theme = useTheme();
  const currentUser = useAtomValue(userAtom);

  const useOrderPlacedListener = () => {
    useEffect(() => {
      const triggerNotification = async (orderId, customerName) => {
        await notifee.requestPermission();

        // Create a notification channel for Android
        await notifee.createChannel({
          id: "order_notifications",
          name: "Order Notifications",
          importance: AndroidImportance.HIGH,
        });

        // Display the notification
        await notifee.displayNotification({
          title: "New Order Received!",
          body: `Order ID: ${orderId} placed by ${customerName}. Review and prepare the order.`,
          android: {
            channelId: "order_notifications",
            smallIcon: "ic_launcher", // Replace with your app's small icon
          },
        });
      };

      const updateNotificationSent = async (docId) => {
        await firestore().collection("orders").doc(docId).update({
          notificationSent: {
            orderPlaced: true
          },
        });
      };

      // Firestore listener for new orders
      const unsubscribe = firestore()
        .collection("orders")
        .where("storeRef", "==", firestore().collection("users").doc(currentUser.id))
        .where("status", "==", "Order Placed")
        .where("notificationSent.orderPlaced", "==", false)
        .onSnapshot(async (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const order = change.doc.data();
              const customerDoc = await order.userRef.get();
              const customerData = customerDoc.data();
              const customerName = `${customerData?.firstName || "Unknown"} ${
                customerData?.lastName || ""
              }`;

              // Trigger notification
              await triggerNotification(change.doc.id, customerName);

              // Update `notificationSent` to true
              await updateNotificationSent(change.doc.id);
            }
          });
        });

      return () => unsubscribe();
    }, [currentUser.id]);
  };

  useOrderPlacedListener();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        headerRight: () => <Header />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          headerShown: false,
          title: "Message",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-text"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orderHistory"
        options={{
          title: "Order History",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
