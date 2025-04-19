import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// THIRD PARTY
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

//CONSTANTS
import { colors, spacingX, spacingY } from "@/constants/theme";

// COMPONENTS
import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";

// UTILS
import { verticalScale } from "@/utils/styling";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* top container view */}
        <View>
          {/* sign in button */}
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Typo
              size={16}
              weight={500}
              color="white"
              style={styles.loginButton}
            >
              Sign In
            </Typo>
          </TouchableOpacity>

          {/* image */}
          <Animated.Image
            entering={FadeIn.duration(1000)}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* footer */}
        <View style={styles.footer}>
          {/* welcome screen text */}
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            style={{ alignItems: "center" }}
          >
            <Typo size={30} weight={800}>
              Always Take Control
            </Typo>
            <Typo size={30} weight={800}>
              of Your Finances
            </Typo>
            <View style={{ alignItems: "center", gap: 2 }}>
              <Typo size={17}>Finances must be arranged to set a better</Typo>
              <Typo size={17}>lifestyle in future.</Typo>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            style={styles.buttonContainer}
          >
            {/* register button */}
            <Button onPress={() => router.push("/(auth)/register")}>
              <Typo size={22} color={colors.neutral900} weight={"600"}>
                Get Started!
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._7,
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  welcomeImage: {
    width: "100%",
    height: verticalScale(300),
    alignSelf: "center",
    marginTop: verticalScale(100),
  },
  footer: {
    backgroundColor: colors.neutral900,
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(40),
    gap: spacingY._20,
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    elevation: 10,
    shadowRadius: 25,
    shadowOpacity: 0.15,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
