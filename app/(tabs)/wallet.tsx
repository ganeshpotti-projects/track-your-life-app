import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// THIRD PARTY
import * as Icons from "phosphor-react-native";
import { FlatList } from "react-native";
import { orderBy, where } from "firebase/firestore";
import { useRouter } from "expo-router";

// CONTEXTS
import { useAuth } from "@/contexts/authContext";

// HOOKS
import useFetchData from "@/hooks/useFetchData";

// CONSTANTS
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

// COMPONENTS
import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import WalletListItem from "@/components/WalletListItem";

// UTILS
import { verticalScale } from "@/utils/styling";

// TYPES
import { WalletType } from "@/types";

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: wallets,
    loading,
    error,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);
  const getTotalBalance = () => {
    let total = 0;
    wallets?.map((item) => {
      total += item.amount || 0;
    });
    return total || 0;
  };
  return (
    <ScreenWrapper style={{ backgroundColor: colors.black }}>
      <View style={styles.container}>
        {/* Balance */}
        <View style={styles.balanceView}>
          <View style={{ alignItems: "center" }}>
            <Typo size={45} weight={500}>
              ₹{getTotalBalance().toFixed(2)}
            </Typo>
            <Typo size={16} color={colors.neutral300}>
              Total Balance
            </Typo>
          </View>
        </View>

        {/* Wallets */}
        <View style={styles.wallets}>
          {/* Header */}
          <View style={styles.flexRow}>
            <Typo size={20} weight={500}>
              My Wallets
            </Typo>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <Icons.PlusCircle
                weight="fill"
                color={colors.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>
          {loading && <Loading />}
          {!loading && wallets.length <= 0 && (
            <Typo
              size={15}
              color={colors.neutral400}
              style={{ textAlign: "center", marginTop: spacingY._15 }}
            >
              No Wallets Found !!
            </Typo>
          )}
          <FlatList
            data={wallets}
            renderItem={({ item, index }) => {
              return (
                <WalletListItem item={item} index={index} route={router} />
              );
            }}
            contentContainerStyle={styles.listStyle}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
