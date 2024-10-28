import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
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
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "70%", "100%"], []);
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

  const { createStoreUser } = useStore();
  const { getUser } = useAccount();
  const handleSnapPress = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const [user, setUser] = useAtom(userAtom)
  useEffect(() => console.log("store", user), [user])
  const handleCreateStore = (data: any) => {
    createStoreUser.mutate({userId: user.id, store: data}, {
      onSuccess: async () => {
        const currentUser = await getUser(user.id)
        setUser(currentUser)
        Toast.show({
          type: "success",
          text1: "Store Created",
          text2: "Store created successfully",
        });
      },
      onError: (err) => {
        console.error(err)
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong",
        });
      }
    })
  };  

  return (
    <GestureHandlerRootView style={[styles.container]}>
      <Text variant="bodyLarge" style={styles.message}>
        You Don’t Have a Store
      </Text>

      <Button mode="contained" onPress={handleSnapPress} style={styles.button}>
        Create Store
      </Button>

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
              Create Store
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  bottomSheetView: {
    flex: 1,
    padding: 20,
  },
  message: {
    textAlign: "center",
    marginVertical: 20,
  },
  button: {
    marginHorizontal: 50,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15
  },
});
