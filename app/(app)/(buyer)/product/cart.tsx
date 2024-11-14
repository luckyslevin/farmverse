import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Checkbox,
  Card,
  Text,
  IconButton,
  Button,
  Divider,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

export default function CartPage() {
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({}); // Track selected items by item
  const [selectedStores, setSelectedStores] = useState({}); // Track selected stores
  const currentUser = useAtomValue(userAtom);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cartSnapshot = await firestore()
          .collection("users")
          .doc(currentUser.id)
          .collection("carts")
          .get();

        const fetchedCartData = {};

        await Promise.all(
          cartSnapshot.docs.map(async (doc) => {
            const cartItemData = doc.data();
            const productDoc = await cartItemData.productRef.get();
            const product = productDoc.data();
            if (product != undefined) {
              console.log("product", product);
              const storeDoc = await product.userRef.get();
              const storeData = storeDoc.data();

              const storeName = storeData.store.name;
              // Group items by store
              if (!fetchedCartData[storeName]) {
                fetchedCartData[storeName] = {
                  store: storeData,
                  items: [],
                };
              }

              fetchedCartData[storeName].items.push({
                id: doc.id,
                quantity: cartItemData.quantity,
                product,
                user: storeData,
              });
            }
          })
        );

        setCartData(Object.values(fetchedCartData)); // Convert object to array for rendering
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleQuantityChange = async (storeName, itemId, increment) => {
    const updatedCartData = [...cartData];
    const storeIndex = updatedCartData.findIndex(
      (cart) => cart.store.store?.name === storeName
    );
    if (storeIndex === -1) return;

    const itemIndex = updatedCartData[storeIndex].items.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex === -1) return;

    const item = updatedCartData[storeIndex].items[itemIndex];
    const newQuantity = item.quantity + increment;

    if (newQuantity <= 0) {
      await firestore()
        .collection("users")
        .doc(currentUser.id)
        .collection("carts")
        .doc(itemId)
        .delete();

      updatedCartData[storeIndex].items.splice(itemIndex, 1);
      if (updatedCartData[storeIndex].items.length === 0) {
        updatedCartData.splice(storeIndex, 1);
      }
    } else {
      await firestore()
        .collection("users")
        .doc(currentUser.id)
        .collection("carts")
        .doc(itemId)
        .update({ quantity: newQuantity });

      item.quantity = newQuantity;
    }

    setCartData(updatedCartData);
  };

  const handleItemCheckboxToggle = (storeName, itemId) => {
    setSelectedItems((prevSelectedItems) => {
      const key = `${storeName}-${itemId}`;
      const updatedSelectedItems = { ...prevSelectedItems };

      if (updatedSelectedItems[key]) {
        delete updatedSelectedItems[key];
      } else {
        updatedSelectedItems[key] = true;
      }

      return updatedSelectedItems;
    });
  };

  const handleStoreCheckboxToggle = (storeName) => {
    setSelectedStores((prevSelectedStores) => {
      const updatedSelectedStores = { ...prevSelectedStores };
      const isSelected = !updatedSelectedStores[storeName];

      if (isSelected) {
        updatedSelectedStores[storeName] = true;
        cartData
          .find((storeGroup) => storeGroup.store.store.name === storeName)
          .items.forEach((item) => {
            setSelectedItems((prevSelectedItems) => ({
              ...prevSelectedItems,
              [`${storeName}-${item.id}`]: true,
            }));
          });
      } else {
        delete updatedSelectedStores[storeName];
        setSelectedItems((prevSelectedItems) => {
          const updatedSelectedItems = { ...prevSelectedItems };
          cartData
            .find((storeGroup) => storeGroup.store.store.name === storeName)
            .items.forEach((item) => {
              delete updatedSelectedItems[`${storeName}-${item.id}`];
            });
          return updatedSelectedItems;
        });
      }

      return updatedSelectedStores;
    });
  };

  const handleSelectAllToggle = () => {
    const allSelected =
      Object.keys(selectedItems).length ===
      cartData.reduce(
        (count, storeGroup) => count + storeGroup.items.length,
        0
      );

    if (allSelected) {
      setSelectedStores({});
      setSelectedItems({});
    } else {
      const newSelectedStores = {};
      const newSelectedItems = {};

      cartData.forEach((storeGroup) => {
        newSelectedStores[storeGroup.store.store.name] = true;
        storeGroup.items.forEach((item) => {
          newSelectedItems[`${storeGroup.store.store.name}-${item.id}`] = true;
        });
      });

      setSelectedStores(newSelectedStores);
      setSelectedItems(newSelectedItems);
    }
  };

  const calculateTotal = () => {
    return cartData.reduce((total, storeGroup) => {
      return (
        total +
        storeGroup.items.reduce((storeTotal, item) => {
          const key = `${storeGroup.store.store.name}-${item.id}`;
          return (
            storeTotal +
            (selectedItems[key] ? item.product.price * item.quantity : 0)
          );
        }, 0)
      );
    }, 0);
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
      <Text style={styles.header}>My Cart</Text>

      {cartData.map((storeGroup) => (
        <View key={storeGroup.store.store.name}>
          <View style={styles.storeHeader}>
            <Checkbox
              status={
                selectedStores[storeGroup.store.store.name]
                  ? "checked"
                  : "unchecked"
              }
              onPress={() =>
                handleStoreCheckboxToggle(storeGroup.store.store.name)
              }
            />
            <Text style={styles.storeName}>
              {storeGroup?.store?.store?.name ?? "N/A"}
            </Text>
          </View>
          <Divider />
          {storeGroup.items.map((item) => (
            <Card key={item.id} style={styles.cartItem}>
              <View style={styles.itemHeader}>
                <Checkbox
                  status={
                    selectedItems[`${storeGroup.store.store.name}-${item.id}`]
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() =>
                    handleItemCheckboxToggle(
                      storeGroup.store.store.name,
                      item.id
                    )
                  }
                />
                <Text style={styles.itemName}>{item.product.name}</Text>
                <IconButton icon="dots-vertical" />
              </View>
              <View style={styles.itemDetails}>
                <Image
                  source={{ uri: item.product.imageUrl }}
                  style={styles.image}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.itemPrice}>₱{item.product.price}</Text>
                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      onPress={() =>
                        handleQuantityChange(
                          storeGroup.store.store.name,
                          item.id,
                          -1
                        )
                      }
                      style={styles.quantityButton}
                    />
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      onPress={() =>
                        handleQuantityChange(
                          storeGroup.store.store.name,
                          item.id,
                          1
                        )
                      }
                      style={styles.quantityButton}
                    />
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Checkbox
          status={
            Object.keys(selectedItems).length ===
            cartData.reduce(
              (count, storeGroup) => count + storeGroup.items.length,
              0
            )
              ? "checked"
              : "unchecked"
          }
          onPress={handleSelectAllToggle}
        />
        <Text>Total: ₱{calculateTotal()}</Text>
        <Button mode="contained" style={styles.checkoutButton}>
          Check Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cartItem: {
    marginVertical: 5,
    borderRadius: 8,
    padding: 10,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  itemPrice: {
    fontSize: 16,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  checkoutButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
  },
});
