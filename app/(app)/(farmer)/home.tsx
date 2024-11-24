import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, Card } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { LineChart } from "react-native-chart-kit";

export default function SalesSummaryPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    newOrders: 0,
    totalSales: 0,
    addedToCart: 0,
    newCustomers: 0,
    earningsHistory: [],
    percentages: {
      newOrders: 0,
      totalSales: 0,
      addedToCart: 0,
      newCustomers: 0,
    },
  });

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setLoading(true);
  
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const startOfLastYear = new Date(new Date().getFullYear() - 1, 0, 1);
  
        // Current year data
        const ordersSnapshot = await firestore()
          .collection("orders")
          .where("createdAt", ">=", startOfYear)
          .get();
  
        // Last year data for comparison
        const lastYearOrdersSnapshot = await firestore()
          .collection("orders")
          .where("createdAt", ">=", startOfLastYear)
          .where("createdAt", "<", startOfYear)
          .get();
  
        // Process current year orders
        let newOrders = 0;
        let totalSales = 0; // For delivered orders only
        let earningsHistory = {};
  
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          newOrders++;
          if (data.status === "Delivered") {
            totalSales += data.totalAmount; // Sum up only delivered orders
            const month = new Date(data.createdAt.toDate()).getMonth();
            earningsHistory[month] = (earningsHistory[month] || 0) + data.totalAmount;
          }
        });
  
        // Process last year orders for comparison
        let lastYearOrders = 0;
        let lastYearSales = 0;
  
        lastYearOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          lastYearOrders++;
          if (data.status === "Delivered") {
            lastYearSales += data.totalAmount; // Sum up only delivered orders
          }
        });
  
        // New customers
        const customersSnapshot = await firestore()
          .collection("users")
          .where("createdAt", ">=", startOfYear)
          .get();
  
        const lastYearCustomersSnapshot = await firestore()
          .collection("users")
          .where("createdAt", ">=", startOfLastYear)
          .where("createdAt", "<", startOfYear)
          .get();
  
        const newCustomers = customersSnapshot.size;
        const lastYearCustomers = lastYearCustomersSnapshot.size;
  
        // Added to cart (fetch from carts subcollection for all users)
        const usersSnapshot = await firestore().collection("users").get();
        let addedToCart = 0;
        let lastYearAddedToCart = 0;
  
        await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const cartsSnapshot = await userDoc.ref
              .collection("carts")
              .where("createdAt", ">=", startOfYear)
              .get();
            addedToCart += cartsSnapshot.size;
  
            const lastYearCartsSnapshot = await userDoc.ref
              .collection("carts")
              .where("createdAt", ">=", startOfLastYear)
              .where("createdAt", "<", startOfYear)
              .get();
            lastYearAddedToCart += lastYearCartsSnapshot.size;
          })
        );
  
        // Calculate percentages
        // const calculatePercentageChange = (current, previous) => {
        //   if (previous === 0) return current > 0 ? 100 : 0; // Handle edge cases
        //   return ((current - previous) / previous) * 100;
        // };
  
        // const percentages = {
        //   newOrders: calculatePercentageChange(newOrders, lastYearOrders),
        //   totalSales: calculatePercentageChange(totalSales, lastYearSales),
        //   addedToCart: calculatePercentageChange(addedToCart, lastYearAddedToCart),
        //   newCustomers: calculatePercentageChange(newCustomers, lastYearCustomers),
        // };
  
        // Prepare data for line chart
        const earningsData = Array.from({ length: 12 }, (_, i) => earningsHistory[i] || 0);
  
        setSummary({
          newOrders,
          totalSales,
          addedToCart,
          newCustomers,
          earningsHistory: earningsData,
          // percentages,
        });
      } catch (error) {
        console.error("Error fetching sales summary:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSalesSummary();
  }, []);  

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

      {/* Metrics Section */}
      <View style={styles.cardsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.newOrders}</Text>
            <Text style={styles.cardLabel}>New Orders</Text>
            {/* <Text style={[styles.cardPercentage, { color: summary.percentages.newOrders >= 0 ? "green" : "red" }]}>
              {summary.percentages.newOrders >= 0 ? "+" : ""}
              {summary.percentages.newOrders.toFixed(1)}%
            </Text> */}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>₱{summary.totalSales}</Text>
            <Text style={styles.cardLabel}>Total Sales</Text>
            {/* <Text style={[styles.cardPercentage, { color: summary.percentages.totalSales >= 0 ? "green" : "red" }]}>
              {summary.percentages.totalSales >= 0 ? "+" : ""}
              {summary.percentages.totalSales.toFixed(1)}%
            </Text> */}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.addedToCart}</Text>
            <Text style={styles.cardLabel}>Added to Cart</Text>
            {/* <Text style={[styles.cardPercentage, { color: summary.percentages.addedToCart >= 0 ? "green" : "red" }]}>
              {summary.percentages.addedToCart >= 0 ? "+" : ""}
              {summary.percentages.addedToCart.toFixed(1)}%
            </Text> */}
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardValue}>{summary.newCustomers}</Text>
            <Text style={styles.cardLabel}>New Customers</Text>
            {/* <Text style={[styles.cardPercentage, { color: summary.percentages.newCustomers >= 0 ? "green" : "red" }]}>
              {summary.percentages.newCustomers >= 0 ? "+" : ""}
              {summary.percentages.newCustomers.toFixed(1)}%
            </Text> */}
          </Card.Content>
        </Card>
      </View>

      {/* Earnings History Section */}
      <Text style={styles.sectionTitle}>Earnings History</Text>
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              data: summary.earningsHistory,
            },
          ],
          legend: ["Earnings"] // optional
        }}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: "#f7fbe1",
          backgroundGradientFrom: "#f7fbe1",
          backgroundGradientTo: "#f7fbe1",
          color: (opacity = 1) => `rgba(47, 79, 79, ${opacity})`,
          strokeWidth: 2,
        }}
        bezier
        yAxisLabel="₱" // Add peso sign to Y-axis values

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
  cardPercentage: {
    fontSize: 12,
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
