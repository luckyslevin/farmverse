import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, useTheme, Avatar, Divider } from "react-native-paper";

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const { createStoreUser } = useStore();
  const { getUser } = useAccount();
  const handleSnapPress = useCallback(() => {
    sheetRef.current?.expand();
  }, []);
  console.log(isDirty, isValid)
  const handleCreateStore = (data: any) => {
    createStoreUser.mutate(
      { userId: user.id, store: data },
      {
        onSuccess: async () => {
          const currentUser = await getUser(user.id);
          setUser(currentUser);
          Toast.show({
            type: "success",
            text1: "Store Created",
            text2: "Store created successfully",
          });
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

  useEffect(() => {
    console.log("reset")
    reset({
      name: user.store?.name,
      description: user.store?.description,
      type: user.store?.type,
      address: user.store?.address,
    });
  }, [reset]);

  return (
    <GestureHandlerRootView style={[styles.container]}>
      <View style={styles.container}>
        {/* Store Avatar and Name */}
        <View style={styles.header}>
          <Avatar.Text size={60} label="T" />
          <Text variant="headlineMedium" style={styles.storeName}>
            {user?.store?.name ?? "You Don’t Have a Store"}
          </Text>
        </View>

        {/* Edit and View Store Buttons */}
        {user?.store?.name && (
          <>
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
              <Text variant="titleMedium" style={styles.noProductText}>
                You don't have any products
              </Text>
              <Button
                mode="outlined"
                onPress={() => router.push("/store/product")}
              >
                Add Product
              </Button>
            </View>
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
}

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
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },

  // addProductButton: {
  //   borderColor: '#2f4f4f', // Dark green color for the outline
  // },
});
