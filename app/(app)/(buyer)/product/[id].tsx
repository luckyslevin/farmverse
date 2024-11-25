import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";
import Toast from "react-native-toast-message";
import { Rating } from "react-native-stock-star-rating";

const { width } = Dimensions.get("window");

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchProductAndUser = async () => {
      try {
        // Fetch product data (replace 'productID' with the actual product document ID)
        const productDoc = await firestore()
          .collection("products")
          .doc(id)
          .get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          setProduct({ id, ...productData });

          // Fetch user data referenced in userRef
          const userDoc = await productData.userRef.get();
          if (userDoc.exists) {
            setUser(userDoc.data());
          }
          // Fetch user details for each rating
          const ratingsWithUserInfo = await Promise.all(
            productData.ratings.map(async (rating) => {
              const userDoc = await rating.userRef.get();

              return {
                ...rating,
                userName: userDoc.exists
                  ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
                  : "Anonymous",
                avatarUrl: userDoc.exists ? userDoc.data().avatarUrl : null,
              };
            })
          );
          setProduct({ id, ...productData, ratings: ratingsWithUserInfo });
        }
      } catch (error) {
        console.error("Error fetching product or user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndUser();
  }, [id]);

  //   useEffect(() => {
  //   const fetchProductAndUser = async () => {
  //     try {
  //       const productDoc = await firestore()
  //         .collection("products")
  //         .doc(id)
  //         .get();

  //       if (productDoc.exists) {
  //         const productData = productDoc.data();

  //         // Fetch user details for each rating
  //         const ratingsWithUserInfo = await Promise.all(
  //           productData.ratings.map(async (rating) => {
  //             const userDoc = await firestore()
  //               .collection("users")
  //               .doc(rating.userId)
  //               .get();

  //             return {
  //               ...rating,
  //               userName: userDoc.exists
  //                 ? `${userDoc.data().firstName} ${userDoc.data().lastName}`
  //                 : "Anonymous",
  //               avatarUrl: userDoc.exists ? userDoc.data().avatarUrl : null,
  //             };
  //           })
  //         );

  //         setProduct({ id, ...productData, ratings: ratingsWithUserInfo });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching product or user details:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProductAndUser();
  // }, [id]);

  const addToCart = async () => {
    try {
      const cartItemRef = firestore()
        .collection("users")
        .doc(currentUser.id)
        .collection("carts")
        .doc(product.id); // Using product ID as the cart item ID

      // Use a transaction to ensure atomic read-modify-write
      await firestore().runTransaction(async (transaction) => {
        const cartItemDoc = await transaction.get(cartItemRef);

        if (cartItemDoc.exists) {
          // If item already exists in the cart, increment the quantity
          const newQuantity = cartItemDoc.data().quantity + 1;
          transaction.update(cartItemRef, { quantity: newQuantity });
        } else {
          // If item does not exist in the cart, set initial quantity to 1
          transaction.set(cartItemRef, {
            productRef: firestore().doc(`products/${product.id}`),
            createdAt: firestore.FieldValue.serverTimestamp(),
            quantity: 1,
          });
        }
      });
      Toast.show({
        type: "success",
        text1: "Product added to cart.",
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Toast.show({
        type: "errror",
        text1: "Could not add product to cart!",
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: product?.imageUrl }} style={styles.image} />

      {/* Product Title and Price */}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>
          {product?.name || "Product Title"}
        </Text>
        <Text style={styles.productPrice}>₱{product?.price || "Price"}</Text>
      </View>

      {/* Store Info with Follow Button */}
      <View style={styles.storeInfo}>
        <View style={styles.storeDetails}>
          {user.store?.avatarUrl ? (
            <Avatar.Image size={40} source={{ uri: user.store.avatarUrl }} />
          ) : (
            <Avatar.Text size={40} label={user?.store?.name.charAt(0) || "t"} />
          )}
          <Text style={styles.storeName}>
            {user?.store?.name || "Store Name"}
          </Text>
        </View>
        {/* <Button mode="contained-tonal" style={styles.followButton}>
          Follow
        </Button> */}
      </View>

      {/* Product Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Product Description</Text>
        <Text style={styles.descriptionText}>
          {product?.description || "No description available for this product."}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          style={styles.addToCartButton}
          onPress={addToCart}
        >
          Add to Cart
        </Button>
        {/* <Button
          mode="contained"
          style={styles.buyNowButton}
          onPress={() => router.push("/product/cart")}
        >
          Buy Now
        </Button> */}
      </View>

      {/* Product Details */}
      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>
            {user?.store?.address || "Location"}
          </Text>
        </View>
        {/* <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition</Text>
          <Text style={styles.detailValue}>{product?.condition || 'Condition'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{product?.category || 'Category'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price Type</Text>
          <Text style={styles.detailValue}>{product?.priceType || 'Price Type'}</Text>
        </View> */}
      </View>
      {/* Customer Reviews */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewHeader}>Customer Reviews</Text>

        {/* Display Average Rating */}
        {product?.ratings && product.ratings.length > 0 ? (
          <>
            <View style={styles.averageRatingContainer}>
              <Text style={styles.averageRatingText}>
                {(
                  product.ratings.reduce(
                    (sum, rating) => sum + rating.rating,
                    0
                  ) / product.ratings.length
                ).toFixed(1)}
              </Text>
              <Rating
                stars={product.ratings.reduce(
                  (sum, rating) => sum + rating.rating,
                  0
                ) / product.ratings.length}
                size={20}
                maxStars={5}
                color={"#FFD700"}
                style={styles.starRating}
              />
              <Text style={styles.totalReviews}>
                ({product.ratings.length} Reviews)
              </Text>
            </View>

            {/* Display Individual Reviews */}
            {product.ratings.map((rating, index) => (
              <View key={index} style={styles.ratingCard}>
                <View style={styles.ratingHeader}>
                  {/* Avatar and Name */}
                  <View style={styles.reviewerInfo}>
                    <Avatar.Image
                      size={40}
                      source={{
                        uri:
                          rating.avatarUrl || "https://via.placeholder.com/100",
                      }}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.reviewerName}>
                        {rating.userName || "Anonymous"}
                      </Text>
                      <Text style={styles.ratingDate}>
                        {new Date(
                          rating.date.seconds * 1000
                        ).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Star Rating for Individual Review */}
                <Rating
                  stars={rating.rating}
                  size={16}
                  maxStars={5}
                  color={"#FFD700"}
                  style={styles.starRating}
                />
                <Text style={styles.reviewText}>{rating.review}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRatingsText}>No reviews available yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf2d7",
  },
  image: {
    width: width,
    height: 250,
  },
  productInfo: {
    padding: 20,
    backgroundColor: "#eaf2d7",
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginTop: 5,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#d9e4d3",
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
  storeDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  followButton: {
    borderRadius: 20,
    backgroundColor: "#4f4f4f",
  },
  descriptionContainer: {
    padding: 20,
    backgroundColor: "#eaf2d7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f4f4f",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  addToCartButton: {
    borderColor: "#2f4f4f",
    borderRadius: 20,
  },
  buyNowButton: {
    backgroundColor: "#2f4f4f",
    borderRadius: 20,
  },
  productDetails: {
    backgroundColor: "#d9e4d3",
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4f4f4f",
  },
  detailValue: {
    fontSize: 14,
    color: "#2f4f4f",
  },
  // reviewSection: {
  //   padding: 20,
  //   backgroundColor: "#f7fbe1",
  //   borderRadius: 8,
  //   marginHorizontal: 10,
  //   marginTop: 20,
  // },
  // reviewHeader: {
  //   fontSize: 18,
  //   fontWeight: "bold",
  //   color: "#2f4f4f",
  //   marginBottom: 10,
  // },
  // averageRating: {
  //   fontSize: 16,
  //   fontWeight: "bold",
  //   color: "#2f4f4f",
  //   marginBottom: 10,
  // },
  // noRatingsText: {
  //   fontSize: 14,
  //   color: "#4f4f4f",
  //   textAlign: "center",
  // },
  // ratingCard: {
  //   padding: 10,
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#d9e4d3",
  //   marginBottom: 10,
  // },
  // ratingHeader: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: 5,
  // },
  // reviewerName: {
  //   fontSize: 14,
  //   fontWeight: "bold",
  //   color: "#2f4f4f",
  // },
  // ratingDate: {
  //   fontSize: 12,
  //   color: "#4f4f4f",
  // },
  // ratingStars: {
  //   flexDirection: "row",
  //   marginBottom: 5,
  // },
  // reviewText: {
  //   fontSize: 14,
  //   color: "#4f4f4f",
  // },
  // reviewerInfo: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  averageRatingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 10,
  },
  starRating: {
    marginHorizontal: 10,
  },
  totalReviews: {
    fontSize: 16,
    color: "#4f4f4f",
  },
  ratingCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#d9e4d3",
    marginBottom: 10,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2f4f4f",
  },
  ratingDate: {
    fontSize: 12,
    color: "#4f4f4f",
  },
  reviewText: {
    fontSize: 14,
    color: "#4f4f4f",
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  noRatingsText: {
    fontSize: 14,
    color: "#4f4f4f",
    textAlign: "center",
  },
});
