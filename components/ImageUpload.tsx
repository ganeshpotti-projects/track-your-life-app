import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// THIRD PARTY
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

// SERVICES
import { getFilePath } from "@/services/imageService";

// CONSTANTS
import { colors, radius } from "@/constants/theme";

// COMPONENTS
import Typo from "./Typo";

// TYPES
import { ImageUploadProps } from "@/types";

// UTILS
import { scale, verticalScale } from "@/utils/styling";

const ImageUpload = ({
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
  placeholder = "",
}: ImageUploadProps) => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      onSelect(result.assets[0]);
    }
  };
  return (
    <View>
      {!file && (
        <TouchableOpacity
          onPress={pickImage}
          style={[styles.inputContainer, containerStyle && containerStyle]}
        >
          <Icons.UploadSimple color={colors.neutral200} />
          {placeholder && <Typo size={15}>{placeholder}</Typo>}
        </TouchableOpacity>
      )}
      {file && (
        <View style={[styles.image, imageStyle && imageStyle]}>
          <Image
            style={{ flex: 1 }}
            source={getFilePath(file)}
            contentFit="cover"
            transition={100}
          />
          <TouchableOpacity style={styles.deleteIcon} onPress={onClear}>
            <Icons.XCircle
              weight="fill"
              color={colors.white}
              size={verticalScale(24)}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  inputContainer: {
    height: verticalScale(54),
    borderRadius: radius._15,
    backgroundColor: colors.neutral700,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderStyle: "dashed",
  },
  image: {
    height: scale(150),
    width: scale(150),
    borderRadius: radius._15,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  deleteIcon: {
    position: "absolute",
    top: scale(6),
    right: scale(6),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
