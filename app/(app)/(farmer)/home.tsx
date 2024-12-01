import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { Text, Card } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

const { width } = Dimensions.get("window");

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
  const [productSales, setProductSales] = useState([]); // For product-specific total sales
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      try {
        setLoading(true);

        const now = new Date();
        let startOfPeriod;

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

        const ordersSnapshot = await firestore()
          .collection("orders")
          .where("createdAt", ">=", startOfPeriod)
          .where(
            "storeRef",
            "==",
            firestore().collection("users").doc(currentUser.id)
          )
          .get();

        let newOrders = 0;
        let totalSales = 0; // For delivered orders only
        let earningsHistory = timeframe === "weekly" ? Array(7).fill(0) : {};
        const productSalesMap = {};

        await Promise.all(
          ordersSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            newOrders++;
            if (data.status === "Delivered") {
              totalSales += data.totalAmount;
              const date = new Date(data.createdAt.toDate());
              const periodKey =
                timeframe === "yearly"
                  ? date.getMonth()
                  : timeframe === "monthly"
                  ? date.getDate() - 1
                  : date.getDay();

              if (timeframe === "weekly") {
                earningsHistory[periodKey] += data.totalAmount;
              } else {
                earningsHistory[periodKey] =
                  (earningsHistory[periodKey] || 0) + data.totalAmount;
              }

              // Calculate total sales for each product
              await Promise.all(
                data.items.map(async (item) => {
                  const productId = item.productId;
                  if (!productSalesMap[productId]) {
                    const productDoc = await item.productRef.get();
                    const productData = productDoc.exists
                      ? productDoc.data()
                      : {};
                    productSalesMap[productId] = {
                      name: item.name || productData.name || "Unknown Product",
                      price: item.price,
                      totalSales: productSalesMap[productId]?.totalSales || 0,
                      quantity: item.quantity || 0,
                      imageUrl:
                        productData.imageUrl ||
                        "https://via.placeholder.com/150",
                    };
                  }

                  productSalesMap[productId].totalSales +=
                    item.price * item.quantity;
                  productSalesMap[productId].quantity += item.quantity;
                })
              );
            }
          })
        );

        const productSalesArray = Object.entries(productSalesMap).map(
          ([productId, data]) => ({
            productId,
            ...data,
          })
        );

        const customersSnapshot = await firestore()
          .collection("users")
          .where("createdAt", ">=", startOfPeriod)
          .get();
        const newCustomers = customersSnapshot.size;

        const usersSnapshot = await firestore().collection("users").get();
        let addedToCart = 0;

        await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const cartsSnapshot = await userDoc.ref
              .collection("carts")
              .where("createdAt", ">=", startOfPeriod)
              .get();

            for (const cartDoc of cartsSnapshot.docs) {
              const cartItem = cartDoc.data();
              const productDoc = await cartItem.productRef.get();
              if (
                productDoc.exists &&
                productDoc.data()?.storeRef?.id === currentUser.id
              ) {
                addedToCart++;
              }
            }
          })
        );

        const earningsData =
          timeframe === "yearly"
            ? Array.from({ length: 12 }, (_, i) => earningsHistory[i] || 0)
            : timeframe === "monthly"
            ? Array.from({ length: 31 }, (_, i) => earningsHistory[i] || 0)
            : earningsHistory;

        setSummary({
          newOrders,
          totalSales,
          addedToCart,
          newCustomers,
          earningsHistory: earningsData,
        });
        setProductSales(productSalesArray);
      } catch (error) {
        console.error("Error fetching sales summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesSummary();
  }, [timeframe]);

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>Sales Summary</Text>

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
                ]
              : timeframe === "monthly"
              ? Array.from({ length: 31 }, (_, i) =>
                  (i + 1) % 5 === 0 ? (i + 1).toString() : ""
                )
              : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          datasets: [
            {
              data: summary.earningsHistory,
            },
          ],
        }}
        width={width - 20}
        height={220}
        chartConfig={{
          backgroundColor: "#f7fbe1",
          backgroundGradientFrom: "#f7fbe1",
          backgroundGradientTo: "#f7fbe1",
          color: (opacity = 1) => `rgba(47, 79, 79, ${opacity})`,
          strokeWidth: 2,
          decimalPlaces: 0,
          labelColor: (opacity = 1) => `rgba(47, 79, 79, ${opacity})`,
        }}
        bezier
        yAxisLabel="₱"
        style={styles.chart}
      />
      <Text style={styles.sectionTitle}>Earnings by product</Text>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <Card style={styles.productCard}>
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Card.Content>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.quantity}>Price: {item.price}</Text>
        <Text style={styles.quantity}>Quantity Sold: {item.quantity}</Text>
        <Text style={styles.totalSales}>Total Sales: ₱{item.totalSales}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f4f4f" />
        <Text>Loading Sales Summary...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={productSales}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.productId}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={renderHeader}
    />
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
    paddingHorizontal: 10,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 8,
  },
  productCard: {
    width: (width - 60) / 2, // Adjust for two columns with consistent spacing
    marginHorizontal: 10, // Horizontal margin for spacing between columns
    marginBottom: 20, // Space between rows
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
  },
  productImage: {
    height: 150,
    width: "100%",
    resizeMode: "cover",
    borderRadius: 0,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#2f4f4f",
    textAlign: "center",
  },
  totalSales: {
    fontSize: 14,
    color: "#4f4f4f",
    textAlign: "center",
  },
  quantity: {
    fontSize: 14,
    color: "#4f4f4f",
    textAlign: "center",
    marginBottom: 5
  },
  listContent: {
    paddingHorizontal: 10, // Consistent padding on both sides
    paddingBottom: 20,
  },
});
