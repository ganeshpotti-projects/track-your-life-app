import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

// THIRD PARTY
import { CaretLeft } from "phosphor-react-native";
import { useRouter } from "expo-router";

// CONSTANTS
import { colors, radius } from "@/constants/theme";

// TYPES
import { BackButtonProps } from "@/types";

// UTILS
import { verticalScale } from "@/utils/styling";

const BackButton = ({ style, iconSize = 20 }: BackButtonProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[styles.button, style]}
    >
      <CaretLeft
        size={verticalScale(iconSize)}
        color={colors.white}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.neutral600,
    alignSelf: "flex-start",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 10,
  },
});
