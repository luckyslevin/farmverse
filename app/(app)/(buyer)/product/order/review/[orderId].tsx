import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function RateProductsPage() {
  const { orderId } = useLocalSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // Store ratings for each product

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

          // Fetch product details
          const itemsWithDetails = await Promise.all(
            data.items.map(async (item) => {
              const productDoc = await item.productRef.get();
              return {
                ...item,
                name: productDoc.data()?.name || "Unknown Product",
                imageUrl:
                  productDoc.data()?.imageUrl ||
                  "https://via.placeholder.com/100",
                productRef: item.productRef,
              };
            })
          );

          setOrderData({ ...data, items: itemsWithDetails });

          // Initialize ratings state with default values
          const initialRatings = {};
          itemsWithDetails.forEach((item) => {
            initialRatings[item.productRef.id] = {
              rating: "",
              review: "",
            };
          });
          setRatings(initialRatings);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load order details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleSubmitRatings = async () => {
    try {
      for (const [productId, { rating, review }] of Object.entries(ratings)) {
        // Skip if the rating is empty or invalid
        if (!rating || isNaN(rating)) {
          continue;
        }
  
        const productRef = firestore().collection("products").doc(productId);
  
        // Fetch existing ratings for the product
        const productDoc = await productRef.get();
        const existingRatings = productDoc.data()?.ratings || [];
  
        // Check if a rating already exists for this orderId and productId
        const existingRatingIndex = existingRatings.findIndex(
          (r) => r.orderId === orderId
        );
  
        if (existingRatingIndex > -1) {
          // Update the existing rating
          existingRatings[existingRatingIndex] = {
            ...existingRatings[existingRatingIndex],
            rating: parseInt(rating, 10),
            review,
            date: firestore.Timestamp.now(),
          };
          await productRef.update({ ratings: existingRatings });
        } else {
          // Add a new rating
          await productRef.update({
            ratings: firestore.FieldValue.arrayUnion({
              userRef: orderData.userRef, // Use userRef
              rating: parseInt(rating, 10),
              review,
              orderId,
              date: firestore.Timestamp.now(),
            }),
          });
        }
      }
  
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Thank you for rating the products!",
      });
  
      // Navigate back or to the home page
      router.push("/(buyer)/product");
    } catch (error) {
      console.error("Error submitting ratings:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit your ratings. Please try again.",
      });
    }
  };
  

  const handleRatingChange = (productId, field, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [productId]: {
        ...prevRatings[productId],
        [field]: value,
      },
    }));
  };

  if (loading || !orderData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f4f4f" />
        <Text style={styles.loadingText}>Loading Order Details...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Rate Products", headerShown: true }} />
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Rate Products</Text>
        {orderData.items.map((item) => (
          <View key={item.productRef.id} style={styles.productCard}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
            />
            <Text style={styles.productName}>{item.name}</Text>
            <TextInput
              label="Rating (1-5)"
              mode="outlined"
              value={ratings[item.productRef.id]?.rating}
              onChangeText={(value) =>
                handleRatingChange(
                  item.productRef.id,
                  "rating",
                  value.replace(/[^0-9]/g, "") // Restrict input to numbers
                )
              }
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter a number between 1 and 5"
            />
            <TextInput
              label="Review"
              mode="outlined"
              value={ratings[item.productRef.id]?.review}
              onChangeText={(value) =>
                handleRatingChange(item.productRef.id, "review", value)
              }
              multiline
              style={styles.textArea}
              placeholder="Write your review here..."
            />
          </View>
        ))}
        <Button
          mode="contained"
          onPress={handleSubmitRatings}
          style={styles.submitButton}
        >
          Submit Ratings
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: "column",
    alignItems: "center",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    marginBottom: 10,
  },
  textArea: {
    width: "100%",
    minHeight: 80,
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
  },
});
