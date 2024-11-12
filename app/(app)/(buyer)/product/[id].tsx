import React, { useEffect, useState } from 'react';
import { Image, View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/stores/user';

const { width } = Dimensions.get('window');

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams()
  const currentUser = useAtomValue(userAtom)

  useEffect(() => {
    const fetchProductAndUser = async () => {
      try {
        // Fetch product data (replace 'productID' with the actual product document ID)
        const productDoc = await firestore().collection('products').doc(id).get();
        if (productDoc.exists) {
          const productData = productDoc.data();
          setProduct({id, ...productData});

          // Fetch user data referenced in userRef
          const userDoc = await productData.userRef.get();
          if (userDoc.exists) {
            setUser(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching product or user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndUser();
  }, []);

  const addToCart = async () => {
    try {
      const cartItemRef = firestore()
        .collection('users')
        .doc(currentUser.id)
        .collection('carts')
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
            quantity: 1,
          });
        }
      });
  
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error("Error adding product to cart:", error);
      Alert.alert('Error', 'Could not add product to cart.');
    }
  };


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: product?.imageUrl }} style={styles.image} />

      {/* Product Title and Price */}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{product?.name || 'Product Title'}</Text>
        <Text style={styles.productPrice}>₱{product?.price || 'Price'}</Text>
      </View>

      {/* Store Info with Follow Button */}
      <View style={styles.storeInfo}>
        <View style={styles.storeDetails}>
          {user?.avatar ? (
            <Avatar.Image size={40} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Text size={40} label="T" />
          )}
          <Text style={styles.storeName}>{user?.store?.name || "Store Name"}</Text>
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
        <Button mode="outlined" style={styles.addToCartButton} onPress={addToCart}>
          Add to Cart
        </Button>
        <Button mode="contained" style={styles.buyNowButton} onPress={() => router.push('/product/cart')}>
          Buy Now
        </Button>
      </View>

      {/* Product Details */}
      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{user?.store?.address || 'Location'}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf2d7',
  },
  image: {
    width: width,
    height: 250,
  },
  productInfo: {
    padding: 20,
    backgroundColor: '#eaf2d7',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f4f4f',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f4f4f',
    marginTop: 5,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#d9e4d3',
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f4f4f',
  },
  followButton: {
    borderRadius: 20,
    backgroundColor: '#4f4f4f',
  },
  descriptionContainer: {
    padding: 20,
    backgroundColor: '#eaf2d7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f4f4f',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4f4f4f',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  addToCartButton: {
    borderColor: '#2f4f4f',
    borderRadius: 20,
  },
  buyNowButton: {
    backgroundColor: '#2f4f4f',
    borderRadius: 20,
  },
  productDetails: {
    backgroundColor: '#d9e4d3',
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f4f4f',
  },
  detailValue: {
    fontSize: 14,
    color: '#2f4f4f',
  },
});
