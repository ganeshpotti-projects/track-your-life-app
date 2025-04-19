import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

// THIRD PARTY
import * as Icons from "phosphor-react-native";
import { useAuth } from "@/contexts/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";

// SERVICES
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";

// CONSTANTS
import { colors, spacingX, spacingY } from "@/constants/theme";

//COMPONENTS
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/Typo";

//TYPES
import { WalletType } from "@/types";

//UTILS
import { scale, verticalScale } from "@/utils/styling";

const WalletModal = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const oldWallet: { name: string; image: string; id: string } =
    useLocalSearchParams();

  useEffect(() => {
    if (oldWallet.id) {
      setWallet({
        name: oldWallet.name,
        image: oldWallet.image,
      });
    }
  }, []);

  const onDelete = async () => {
    if (!oldWallet.id) {
      return;
    }
    setLoading(true);
    const res = await deleteWallet(oldWallet.id);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure, want to delete wallet? \n This will remove all the transactions related to this wallet.",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancel delete");
          },
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: onDelete,
          style: "destructive",
        },
      ]
    );
  };

  const onSubmit = async () => {
    let { name, image } = wallet;
    if (!name.trim() || !image) {
      Alert.alert("Wallet,", "Please fill all the fields");
      return;
    }
    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (oldWallet.id) {
      data.id = oldWallet.id;
    }
    setLoading(true);
    const res = await createOrUpdateWallet(data);
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet: ", res.msg);
    }
  };

  return (
    <ModalWrapper style={styles.container}>
      <View style={styles.container}>
        {/* header with backbutton & title */}
        <Header
          title={oldWallet.id ? "Update Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* input container */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input
              placeholder="Amazon"
              value={wallet.name}
              onChangeText={(value) => setWallet({ ...wallet, name: value })}
            />
          </View>

          {/* wallet icon Upload */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>
            <ImageUpload
              file={wallet.image}
              placeholder="Upload Image"
              onSelect={(file) => setWallet({ ...wallet, image: file })}
              onClear={() => setWallet({ ...wallet, image: null })}
            />
          </View>
        </ScrollView>
      </View>

      {/* footer */}
      <View style={styles.footer}>
        {/* delete & update buttons */}
        {oldWallet.id && !loading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15,
            }}
            onPress={showDeleteAlert}
          >
            <Icons.Trash
              size={verticalScale(24)}
              color={colors.white}
              weight="bold"
            />
          </Button>
        )}

        <Button onPress={onSubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} weight={700}>
            {oldWallet.id ? "Update Wallet" : "Add Wallet"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  inputContainer: {
    gap: spacingY._20,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(12),
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
});
