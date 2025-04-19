import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

// THIRD PARTY
import { orderBy, where } from "firebase/firestore";

// CONTEXTS
import { useAuth } from "@/contexts/authContext";

// HOOKS
import useFetchData from "@/hooks/useFetchData";

// CONSTANTS
import { colors, spacingY } from "@/constants/theme";

//COMPONENTS
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ModalWrapper from "@/components/ModalWrapper";

//TYPES
import { TransactionType } from "@/types";

import TransactionList from "@/components/TransactionList";

const SearchModal = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const constraints = [where("uid", "==", user?.uid), orderBy("date", "desc")];

  const {
    data: allTransactions,
    loading: transactionsLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.type?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
      <View style={styles.container}>
        {/* header */}
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          {/* input container */}
          <View style={styles.inputContainer}>
            <Input
              placeholder="Shoes, Rent..."
              value={search}
              placeholderTextColor={colors.neutral400}
              containerStyle={{ backgroundColor: colors.neutral800 }}
              onChangeText={(value) => setSearch(value)}
            />
          </View>

          {/* transaction List */}
          <TransactionList
            loading={transactionsLoading}
            data={filteredTransactions}
            emptyListMessage="No transaction matches your searched keyword"
          />
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

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
});
