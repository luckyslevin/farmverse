import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import {
  Text,
  Button,
  useTheme,
  Avatar,
  Divider,
  Card,
  Title,
  Paragraph,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FVInput from "@/components/FVInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useStore, { schema } from "@/hooks/useStore";
import { useAtom } from "jotai";
import { userAtom } from "@/stores/user";
import Toast from "react-native-toast-message";
import { useAccount } from "@/hooks/useAccount";
import { router } from "expo-router";

export default function Page() {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "70%", "100%"], []);
  const [user, setUser] = useAtom(userAtom);
  const [products, setProducts] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { createStoreUser } = useStore();
  const { getUser } = useAccount();
  const handleSnapPress = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  // Fetch products from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("products")
      .where("userRef", "==", firestore().collection("users").doc(user.id))
      .onSnapshot(
        (querySnapshot) => {
          const productList: any = [];
          querySnapshot.forEach((documentSnapshot) => {
            productList.push({
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
          setProducts(productList);
        },
        (error) => {
          console.error("Error fetching products: ", error);
        }
      );

    // Unsubscribe from events when no longer in use
    return () => unsubscribe();
  }, []);

  const handleCreateStore = (data: any) => {
    createStoreUser.mutate(
      {
        userId: user.id,
        store: { ...data, description: data.description ?? "" },
      },
      {
        onSuccess: async () => {
          const currentUser = await getUser(user.id);
          if (user?.store) {
            Toast.show({
              type: "success",
              text1: "Store Updated",
              text2: "Store updated successfully",
            });
          } else {
            Toast.show({
              type: "success",
              text1: "Store Created",
              text2: "Store created successfully",
            });
          }
          setUser(currentUser);
        },
        onError: (err) => {
          console.error(err);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong",
          });
        },
      }
    );
  };

  const handleDeleteProduct = (productId: any) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            firestore()
              .collection("products")
              .doc(productId)
              .delete()
              .then(() => {
                console.log("Product deleted successfully!");
                // Optionally, update your local state to remove the deleted product
                setProducts((prevProducts) =>
                  prevProducts.filter((product) => product?.id !== productId)
                );
              })
              .catch((error) => {
                console.error("Error deleting product: ", error);
              });
          },
        },
      ]);
    }

    useEffect(() => {
      console.log("reset");
      reset({
        name: user.store?.name,
        description: user.store?.description,
        type: user.store?.type,
        address: user.store?.address,
      });
    }, [reset]);
    // Sample data
    const renderProduct = ({ item }: {item: any}) => (
      <Card style={styles.card} elevation={3}>
        {/* Conditional rendering for image */}
        {item.imageUrl ? (
          <Card.Cover
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Avatar.Icon
              size={64}
              icon="image-off"
              style={styles.placeholderImage}
            />
          </View>
        )}

        <Card.Content style={styles.cardContent}>
          <Title style={styles.title}>{item.name}</Title>
          {/* <Paragraph style={styles.description}>{item.description}</Paragraph> */}
          <Paragraph style={styles.price}>P {item.price}</Paragraph>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => console.log("Edit Product", item.id)}
            style={styles.editButton}
          >
            Edit
          </Button>
          <Button mode="contained" onPress={() => handleDeleteProduct(item.id)}>
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
    return (
      <GestureHandlerRootView style={[styles.container]}>
        <View>
          {/* Store Avatar and Name */}
          {!user?.store?.name && (
            <View style={styles.header}>
              <Avatar.Text size={60} label="T" />
              <Text variant="headlineMedium" style={styles.storeName}>
                You Don’t Have a Store
              </Text>
              <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleSnapPress}>
                  Add Store
                </Button>
              </View>
            </View>
          )}

          {/* Edit and View Store Buttons */}
          {user?.store?.name && (
            <>
              <View style={styles.header}>
                <Avatar.Text size={60} label="T" />
                <Text variant="headlineMedium" style={styles.storeName}>
                  {user?.store?.name}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleSnapPress}>
                  Edit Store
                </Button>
                {/* <Button
                mode="contained"
                onPress={() => console.log("View Store")}
              >
                View Store
              </Button> */}
              </View>
              <Divider style={styles.divider} />

              <View style={styles.placeholderContainer}>
                <Button
                  mode="outlined"
                  onPress={() => router.push("/store/product")}
                >
                  Add Product
                </Button>
                <Text variant="titleMedium" style={styles.noProductText}>
                  {products ? "Products" : "You don't have any products"}
                </Text>
              </View>
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                horizontal // Enables horizontal scrolling
                showsHorizontalScrollIndicator={false} // Hides the horizontal scrollbar
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
        </View>
        {/* <Text variant="bodyLarge" style={styles.message}>
        {user?.store?.name ?? "You Don’t Have a Store"}
      </Text> */}

        {/* <Button mode="contained" onPress={handleSnapPress} style={styles.button}>
      {user?.store ? "Edit " : " Store" } Store
      </Button>

      <Button mode="contained" onPress={() => router.push("/store/product")}>
        Add Product
      </Button> */}

        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
        >
          <BottomSheetView
            style={[
              styles.bottomSheetView,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={{ justifyContent: "center" }}>
              <FVInput
                control={control}
                name="name"
                errors={errors}
                props={{
                  placeholder: "Store Name",
                  mode: "outlined",
                  style: styles.input,
                }}
              />
              <FVInput
                control={control}
                name="description"
                errors={errors}
                props={{
                  placeholder: "Description",
                  mode: "outlined",
                  style: styles.input,
                }}
              />
              <FVInput
                control={control}
                name="address"
                errors={errors}
                props={{
                  placeholder: "Address",
                  mode: "outlined",
                  style: styles.input,
                }}
              />

              <FVInput
                control={control}
                name="type"
                errors={errors}
                props={{
                  placeholder: "Store Type",
                  mode: "outlined",
                  style: styles.input,
                }}
              />
              <Button
                mode="contained"
                disabled={!isDirty || !isValid}
                onPress={handleSubmit(handleCreateStore)}
              >
                {user?.store ? "Edit " : "Create "} Store
              </Button>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: '#eaf2d7', // Light green background
      padding: 20,
    },
    bottomSheetView: {
      flex: 1,
      padding: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
    },
    message: {
      textAlign: "center",
      marginVertical: 20,
    },
    // avatar: {
    //   backgroundColor: '#2f4f4f', // Dark green color
    // },
    storeName: {
      fontWeight: "bold",
      marginTop: 10,
      color: "#2f4f4f", // Dark green color
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 15,
    },
    // viewStoreButton: {
    //   backgroundColor: '#2f4f4f', // Dark green color
    // },
    removeStoreText: {
      textAlign: "center",
      // color: '#a9a9a9', // Light gray color
      marginVertical: 10,
    },
    divider: {
      // backgroundColor: '#dcdcdc',
      marginVertical: 20,
    },
    placeholderContainer: {
      alignItems: "center",
      marginTop: 30,
    },
    noProductText: {
      // color: '#2f4f4f', // Dark green color
      marginVertical: 10,
    },
    input: {
      marginBottom: 15,
    },

    // addProductButton: {
    //   borderColor: '#2f4f4f', // Dark green color for the outline
    // },
    listContent: {
      paddingVertical: 10,
    },
    card: {
      width: 260, // Set a consistent width for each card
      marginVertical: 10,
      marginRight: 15, // Space between cards
      borderRadius: 20, // Rounded corners
      backgroundColor: "#eaf2d7", // Light green background color
      overflow: "hidden",
      alignSelf: 'center',      // Center the card itself
    },
    cardImage: {
      // height: 120,
      borderRadius: 20, // Rounded corners
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20,
    },
    placeholderImageContainer: {
      // height: 120,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#d3d3d3",
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20,
    },
    placeholderImage: {
      backgroundColor: "transparent",
    },
    cardContent: {
      // paddingHorizontal: 16,
      // paddingVertical: 10,
      alignItems: "center", // Center align content horizontally
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      // color: '#2f4f4f', // Dark green color
    },
    description: {
      fontSize: 14,
      color: "#666",
      marginTop: 5,
    },
    price: {
      fontSize: 16,
      color: "#2f4f4f",
      fontWeight: "bold",
      marginTop: 10,
    },
    cardActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    editButton: {
      borderColor: "#2f4f4f",
    },
  }); 
