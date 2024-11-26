import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Text, Card } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

export default function SalesSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("yearly"); // yearly, monthly, weekly
  const [summary, setSummary] = useState({
    newOrders: 0,
    totalSales: 0,
    addedToCart: 0,
    newCustomers: 0,
    earningsHistory: [],
  });
  const currentUser = useAtomValue(userAtom)

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setLoading(true);

        const now = new Date();
        let startOfPeriod;

        // Define the start of the period based on the selected timeframe
        if (timeframe === "yearly") {
          startOfPeriod = new Date(now.getFullYear(), 0, 1);
        } else if (timeframe === "monthly") {
          startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (timeframe === "weekly") {
          const startOfWeek = now.getDate() - now.getDay(); // Start on Sunday
          startOfPeriod = new Date(
            now.getFullYear(),
            now.getMonth(),
            startOfWeek
          );
        }

        // Fetch orders for the selected timeframe
        const ordersSnapshot = await firestore()
          .collection("orders")
          .where("createdAt", ">=", startOfPeriod)
          .where("storeRef", "==", firestore().collection("users").doc(currentUser.id))
          .get();

        let newOrders = 0;
        let totalSales = 0; // For delivered orders only
        let earningsHistory = timeframe === "weekly" ? Array(7).fill(0) : {};

        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          newOrders++;
          if (data.status === "Delivered") {
            totalSales += data.totalAmount; // Sum up only delivered orders

            const date = new Date(data.createdAt.toDate());
            const periodKey =
              timeframe === "yearly"
                ? date.getMonth() // Month index for yearly
                : timeframe === "monthly"
                ? date.getDate() - 1 // Date index for monthly
                : date.getDay(); // Day index (0 = Sun, 6 = Sat) for weekly

            if (timeframe === "weekly") {
              earningsHistory[periodKey] += data.totalAmount;
            } else {
              earningsHistory[periodKey] =
                (earningsHistory[periodKey] || 0) + data.totalAmount;
            }
          }
        });

        // New customers for the selected timeframe
        const customersSnapshot = await firestore()
          .collection("users")
          .where("createdAt", ">=", startOfPeriod)
          .get();
        const newCustomers = customersSnapshot.size;

        // Added to cart (fetch from carts subcollection for all users)
        const usersSnapshot = await firestore().collection("users").get();
        let addedToCart = 0;

        await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const cartsSnapshot = await userDoc.ref
              .collection("carts")
              .where("createdAt", ">=", startOfPeriod)
              .get();
            addedToCart += cartsSnapshot.size;
          })
        );

        // Prepare data for line chart
        const earningsData =
          timeframe === "yearly"
            ? Array.from({ length: 12 }, (_, i) => earningsHistory[i] || 0)
            : timeframe === "monthly"
            ? Array.from({ length: 31 }, (_, i) => earningsHistory[i] || 0)
            : earningsHistory; // Weekly data is already aligned

        setSummary({
          newOrders,
          totalSales,
          addedToCart,
          newCustomers,
          earningsHistory: earningsData,
        });
      } catch (error) {
        console.error("Error fetching sales summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesSummary();
  }, [timeframe]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f4f4f" />
        <Text>Loading Sales Summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sales Summary</Text>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {["weekly", "monthly", "yearly"].map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setTimeframe(period)}
            style={[
              styles.timeframeButton,
              timeframe === period && styles.activeTimeframe,
            ]}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === period && styles.activeTimeframeText,
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metrics Section */}
      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.newOrders}</Text>
            <Text style={styles.cardLabel}>New Orders</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>₱{summary.totalSales}</Text>
            <Text style={styles.cardLabel}>Total Sales</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.addedToCart}</Text>
            <Text style={styles.cardLabel}>Added to Cart</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.newCustomers}</Text>
            <Text style={styles.cardLabel}>New Customers</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Earnings History Section */}
      <Text style={styles.sectionTitle}>Earnings History</Text>
      <LineChart
        data={{
          labels:
            timeframe === "yearly"
              ? [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ] // 12 months
              : timeframe === "monthly"
              ? Array.from({ length: 31 }, (_, i) =>
                  (i + 1) % 5 === 0 ? (i + 1).toString() : ""
                ) // Every 5th day
              : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Weekly labels
          datasets: [
            {
              data: summary.earningsHistory,
            },
          ],
        }}
        width={350} // Ensure this matches your screen width
        height={220}
        chartConfig={{
          backgroundColor: "#f7fbe1",
          backgroundGradientFrom: "#f7fbe1",
          backgroundGradientTo: "#f7fbe1",
          color: (opacity = 1) => `rgba(47, 79, 79, ${opacity})`,
          strokeWidth: 2, // Thickness of the line
          decimalPlaces: 0, // No decimal places for y-axis values
          labelColor: (opacity = 1) => `rgba(47, 79, 79, ${opacity})`,
        }}
        bezier // Smooth curve for the chart
        yAxisLabel="₱" // Prefix for y-axis values
        style={styles.chart}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fbe1",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f4f4f",
    textAlign: "center",
    marginBottom: 20,
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  timeframeButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#dcdcdc",
  },
  activeTimeframe: {
    backgroundColor: "#2f4f4f",
  },
  timeframeText: {
    color: "#4f4f4f",
  },
  activeTimeframeText: {
    color: "#ffffff",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  cardLabel: {
    fontSize: 14,
    color: "#4f4f4f",
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 8,
  },
});