import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

// THIRD PARTY
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";

// CONTEXTS
import { useAuth } from "@/contexts/authContext";

//CONSTANTS
import { colors, spacingX, spacingY } from "@/constants/theme";

// COMPONENTS
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";

//UTILS
import { verticalScale } from "@/utils/styling";

const Register = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Please fill all the fields!!");
      return;
    }
    setIsLoading(true);
    const res = await registerUser(
      emailRef.current,
      passwordRef.current,
      nameRef.current
    );
    if (!res.success) {
      Alert.alert("Sign Up", res.msg);
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* back button */}
        <BackButton iconSize={24} />

        {/* welcome text */}
        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} weight={800}>
            Let's
          </Typo>
          <Typo size={30} weight={800}>
            Get Started 🙂
          </Typo>
        </View>

        {/* register form */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Create an Account to track your expenses
          </Typo>

          <Input
            placeholder="Enter Your Name"
            onChangeText={(value) => (nameRef.current = value)}
            icon={
              <Icons.User
                size={verticalScale(22)}
                color={colors.neutral300}
                weight="regular"
              />
            }
          />

          <Input
            placeholder="Enter Your Email"
            onChangeText={(value) => (emailRef.current = value)}
            icon={
              <Icons.At
                size={verticalScale(22)}
                color={colors.neutral300}
                weight="regular"
              />
            }
          />

          <Input
            placeholder="Enter Your Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            icon={
              <Icons.Lock
                size={verticalScale(22)}
                color={colors.neutral300}
                weight="regular"
              />
            }
          />
        </View>

        {/* sign up button */}
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo size={21} color={colors.black} weight={700}>
            Sign Up
          </Typo>
        </Button>

        {/* footer */}
        <View style={styles.footer}>
          <Typo size={15}>Already have an Account?</Typo>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Typo size={15} weight={"700"} color={colors.primary}>
              Sign In
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
