import { createContext, useContext, useEffect, useState } from "react";

// THIRD PARTY
import { auth, firestore } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

// TYPES
import { AuthContextType, UserType } from "@/types";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null); // Fixed type issue
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          name: firebaseUser?.displayName,
        });
        updateUserData(firebaseUser.uid);
        router.replace("/(tabs)");
      } else {
        setUser(null);
        router.replace("/(auth)/welcome");
      }
    });
    return () => unsub();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        msg: "Logged in Successfully!",
      };
    } catch (error: any) {
      let message = error.message;
      if (message.includes("(auth/invalid-credential)")) {
        message = "Invalid Credentials [Re-Enter]";
      } else if (message.includes("(auth/invalid-email)")) {
        message = "Invalid E-mail [Re-Enter]";
      } else {
        message = error.message;
      }
      return {
        success: false,
        msg: message,
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      let response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(firestore, "users", response.user.uid), {
        email,
        uid: response.user.uid,
        name,
      });
      return {
        success: true,
        msg: "Registered Successfully!",
      };
    } catch (error: any) {
      let message = error.message;
      if (message.includes("(auth/email-already-in-use)")) {
        message = "Email Already in use [Sign In]";
      } else if (message.includes("(auth/invalid-email)")) {
        message = "Invalid E-mail [Re-Enter]";
      } else if (message.includes("(auth/weak-password)")) {
        message = "Password Should Contain Min contain 6 Characters [Re-Enter]";
      } else {
        message = error.message;
      }
      return {
        success: false,
        msg: error.message,
      };
    }
  };

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const userData: UserType = {
          uid: data?.uid,
          email: data?.email || null,
          name: data?.name || null,
          image: data?.image || null,
        };
        setUser(userData);
      }
    } catch (error: any) {
      console.error("Error updating user data:", error.message);
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }
  return context;
};
