import Header from "@/components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";

import { useEffect } from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";



export default function Layout() {
  const theme = useTheme();
  const currentUser = useAtomValue(userAtom);

  const useOrderStatusListener = () => {
    useEffect(() => {
      const triggerNotification = async (title, body) => {
        await notifee.requestPermission();
  
        // Create a notification channel for Android
        await notifee.createChannel({
          id: "order_notifications",
          name: "Order Notifications",
          importance: AndroidImportance.HIGH,
        });
  
        // Display the notification
        await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: "order_notifications",
            smallIcon: "ic_launcher", // Replace with your app's small icon
          },
        });
      };
  
      const updateNotificationSent = async (docId, status) => {
        await firestore()
          .collection("orders")
          .doc(docId)
          .update({
            [`notificationSent.${status}`]: true,
          });
      };
  
      // Firestore listener for order status updates
      const unsubscribe = firestore()
        .collection("orders")
        .where("userRef", "==", firestore().collection("users").doc(currentUser.id))
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "modified" || change.type === "added") {
              const order = change.doc.data();
              const { status, notificationSent = {} } = order;
              console.log(status, notificationSent)
              // Check for specific statuses and whether notification has already been sent
              if (status === "Order Confirmed" && !notificationSent["orderConfirmed"]) {
                const customerDoc = await order.userRef.get();
                const customerData = customerDoc.data();
                const customerName = `${customerData?.firstName || "Unknown"} ${
                  customerData?.lastName || ""
                }`;
  
                // Trigger notification for Order Confirmed
                await triggerNotification(
                  "Order Confirmed!",
                  `Order ID: ${change.doc.id} placed by ${customerName} has been confirmed.`
                );
  
                // Update Firestore to mark notification as sent
                await updateNotificationSent(change.doc.id, "orderConfirmed");
              }
              
              if (status === "Delivered" && !notificationSent["delivered"]) {
                const customerDoc = await order.userRef.get();
                const customerData = customerDoc.data();
                const customerName = `${customerData?.firstName || "Unknown"} ${
                  customerData?.lastName || ""
                }`;
  
                // Trigger notification for Delivered
                await triggerNotification(
                  "Order Delivered!",
                  `Order ID: ${change.doc.id} placed by ${customerName} has been delivered.`
                );
  
                // Update Firestore to mark notification as sent
                await updateNotificationSent(change.doc.id, "delivered");
              }
            }
          });
        });
  
      // Cleanup the listener on component unmount
      return () => unsubscribe();
    }, [currentUser.id]);
  };

  useOrderStatusListener()
  

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
        headerRight: () => (
          <Header/>
        )
      }}
    >
       <Tabs.Screen
        name="product"
        options={{
          headerShown: false,
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shopping" color={color} size={size} />
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
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={size}
            />
          ),
        }}
      />
      
      {/* <Tabs.Screen
        name="product"
        options={{ headerShown: false, title: "Products" }}
      />
      <Tabs.Screen
        name="message"
        options={{ headerShown: false, title: "Message" }}
      />
      <Tabs.Screen name="store" options={{ title: "Store" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} /> */}
    </Tabs>
  );
}
