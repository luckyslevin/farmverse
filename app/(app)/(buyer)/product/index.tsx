import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 20 padding on each side and 2 cards per row
const CARD_HEIGHT = 230; // Fixed height for each card

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products with user data from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productList = [];

      const productsSnapshot = await firestore().collection('products').get();

      // For each product, fetch the user details using userRef
      for (const doc of productsSnapshot.docs) {
        const productData = doc.data();
        const userRef = productData.userRef;

        // Fetch user data from userRef
        const userSnapshot = await userRef.get();
        const userData = userSnapshot.data();

        productList.push({
          id: doc.id,
          ...productData,
          user: userData
          // sellerAvatar: userData.avatar,
        });
      }

      setProducts(productList);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => router.push({pathname: "/product/[id]", params: {id: item.id}})}>
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.image} />
      <Card.Content>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.sellerContainer}>
          {/* <Avatar.Image size={20} source={{ uri: item.user.avatar }} /> */}
          <Avatar.Text size={20} label="t" />
          <Text style={styles.sellerName}>{item.user.store.name}</Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Text style={styles.price}>P {item.price}</Text>
      </Card.Actions>
    </Card>
  );

  return (<>
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
        />
      )}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf2d7', // Light green background
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 10,
    // marginHorizontal: 10, // Equal horizontal margins for balance
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  image: {
    height: 120,
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 0
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#2f4f4f', // Dark green color for text
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  sellerName: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4f4f4f',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
