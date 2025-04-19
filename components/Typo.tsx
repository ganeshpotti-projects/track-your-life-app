import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

// CONSTANTS
import { colors } from "@/constants/theme";

// TYPES
import { TypoProps } from "@/types";

// UTILS
import { verticalScale } from "@/utils/styling";

const Typo = ({
  size,
  color = colors.text,
  weight = "400",
  children,
  style,
  textProps = {},
}: TypoProps) => {
  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
    color,
    fontWeight: weight,
  };
  return (
    <Text style={[textStyle, style]} {...textProps}>
      {children}
    </Text>
  );
};

export default Typo;
