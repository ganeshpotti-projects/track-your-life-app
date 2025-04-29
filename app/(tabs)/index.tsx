import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// THIRD PARTY
import * as Icons from "phosphor-react-native";
import { limit, orderBy, where } from "firebase/firestore";
import { useRouter } from "expo-router";

//CONTEXTS
import { useAuth } from "@/contexts/authContext";

// HOOKS
import useFetchData from "@/hooks/useFetchData";

// CONSTANTS
import { colors, spacingX, spacingY } from "@/constants/theme";

// COMPONENTS
import Button from "@/components/Button";
import HomeCard from "@/components/HomeCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import TransactionList from "@/components/TransactionList";
import Typo from "@/components/Typo";

// UTILS
import { verticalScale } from "@/utils/styling";

// TYPES
import { TransactionType, WalletType } from "@/types";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: wallets,
    loading: walletsLoading,
    error: walletError,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(60),
  ];

  const {
    data: recentTransactions,
    loading: transactionsLoading,
    // check
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const showCreateAlert = () => {
    if (wallets.length === 0) {
      Alert.alert("Confirm", "Want to create a wallet?", [
        {
          text: "Cancel",
          onPress: () => console.log("cancel creation"),
          style: "cancel",
        },
        {
          text: "Create Wallet",
          onPress: () => router.push("/(modals)/walletModal"),
          style: "default",
        },
      ]);
    } else {
      router.push("/(modals)/transactionModal");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* header with welcome text and name */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello,
            </Typo>
            <Typo size={20} weight={500}>
              {user?.name}
            </Typo>
          </View>

          {/* search button */}
          <TouchableOpacity
            style={styles.searchIcon}
            onPress={() => router.push("/(modals)/searchModal")}
          >
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={colors.neutral200}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsHorizontalScrollIndicator={false}
        >
          {/* card */}
          <HomeCard />

          {/* transaction list */}
          <TransactionList
            data={recentTransactions}
            loading={false}
            title="Recent Transactions"
            emptyListMessage="No Transactions added yet!"
          />
        </ScrollView>

        {/* create transaction button */}
        <Button style={styles.floatingButton} onPress={showCreateAlert}>
          <Icons.Plus
            color={colors.black}
            weight="bold"
            size={verticalScale(24)}
          />
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  scrollViewStyle: {
    marginTop: spacingY._20,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
