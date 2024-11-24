import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import Header from "@/components/Header";

import { useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";


export default function Layout() {
  const theme = useTheme();

  const useOrderPlacedListener = () => {
    const currentUser = useAtomValue(userAtom);
  
    useEffect(() => {
      // Function to display Notifee notification
      const triggerNotification = async (orderId, customerName) => {
        await notifee.requestPermission();
  
        // Create a channel (only needed for Android)
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
            smallIcon: "ic_launcher", // Use your app's icon
          },
        });
      };
  
      // Set up Firestore listener
      const unsubscribe = firestore()
        .collection("orders")
        .where("storeRef", "==", firestore().collection("users").doc(currentUser.id))
        .where("status", "==", "Order Placed")
        .onSnapshot(async (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const order = change.doc.data();
              // Fetch customer details
              const customerDoc = await order.userRef.get();
              const customerData = customerDoc.data();
              const customerName = `${customerData?.firstName || "Unknown"} ${
                customerData?.lastName || ""
              }`;
              console.log(change.doc.id)
              // Trigger notification
              triggerNotification(change.doc.id, customerName);
            }
          });
        });
  
      // Cleanup the listener on component unmount
      return () => unsubscribe();
    }, [currentUser.id]);
  }
  
  useOrderPlacedListener()
  

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
        ),
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
            name="clipboard-list-outline" // Icon for order history

              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>    
  );
}