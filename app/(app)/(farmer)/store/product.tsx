import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/stores/user';

export default function CreateProduct() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const currentUser = useAtomValue(userAtom);

  // Pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);
    }
  };

  // Upload image to Firebase Storage and get the download URL
  const uploadImage = async () => {
    if (!imageUri) return null;

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
      return null;
    }
  };

  // Save the product data in Firestore
  const createProduct = async () => {
    const imageUrl = await uploadImage();
    if (!imageUrl) return;

    try {
      await firestore().collection('products').add({
        name: productName,
        category: category,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description: description,
        imageUrl: imageUrl,
        userRef: firestore().collection('users').doc(currentUser.id), // Reference to the user document
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  return (
    <>
    <Stack.Screen options={{title: "Add Product"}}/>
    <View style={styles.container}>
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
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, { height: 100 }]}
        mode="outlined"
      />

      <Button icon="image" mode="contained" onPress={pickImage} style={styles.button}>
        Pick Image
      </Button>

      {imageUri && (
        // <Card style={styles.imageCard} mode="contained">
        //   <Card.Cover source={{ uri: imageUri }} style={styles.image} />
        // </Card>
          <Image source={{ uri: imageUri }} style={styles.image} />
      )}

      {uploading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <Button mode="contained" onPress={createProduct} style={styles.button}>
          Create Product
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
  imageCard: {
    marginVertical: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover'
  },
  loading: {
    marginVertical: 20,
  },
});
