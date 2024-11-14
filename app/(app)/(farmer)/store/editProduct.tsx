import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
const { width: screenWidth } = Dimensions.get('window');

export default function EditProduct() {
  const { productId } = useLocalSearchParams(); // Assuming productId is passed as a route parameter
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUri, setExistingImageUri] = useState(null); // Store existing image URL
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for fetching product data

  // Load existing product data
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;

      setLoading(true); // Start loading indicator
      try {
        const productDoc = await firestore().collection('products').doc(productId).get();
        if (productDoc.exists) {
          const data = productDoc.data();
          setProductName(data.name);
          setCategory(data.category);
          setPrice(data.price.toString());
          setQuantity(data.quantity.toString());
          setDescription(data.description);
          setExistingImageUri(data.imageUrl);
        } else {
          alert("Product not found!");
        }
      } catch (error) {
        console.error("Error loading product data:", error);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    loadProductData();
  }, [productId]);

  // Pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);
    }
  };

  // Upload image to Firebase Storage and get the download URL
  const uploadImage = async () => {
    if (!imageUri) return existingImageUri;

    const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`products/${filename}`);

    setUploading(true);
    try {
      await storageRef.putFile(imageUri);
      const downloadURL = await storageRef.getDownloadURL();
      setUploading(false);
      return downloadURL;
    } catch (error) {
      console.error("Failed to upload image:", error);
      setUploading(false);
      return existingImageUri; // If upload fails, return existing image URL
    }
  };

  // Update the product data in Firestore
  const updateProduct = async () => {
    const imageUrl = await uploadImage();

    try {
      await firestore().collection('products').doc(productId).update({
        name: productName,
        category: category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description: description,
        imageUrl: imageUrl,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Product Data...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Product" }} />
      <View style={styles.container}>

        {(imageUri || existingImageUri) && (
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: imageUri || existingImageUri }} style={styles.image} />
          </TouchableOpacity>
        )}

        <TextInput
          label="Product Name"
          value={productName}
          onChangeText={setProductName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, { height: 100 }]}
          mode="outlined"
        />

        {uploading ? (
          <ActivityIndicator size="large" style={styles.loading} />
        ) : (
          <Button mode="contained" onPress={updateProduct} style={styles.button}>
            Update Product
          </Button>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  image: {
    width: screenWidth,
    height: 250,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  loading: {
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
