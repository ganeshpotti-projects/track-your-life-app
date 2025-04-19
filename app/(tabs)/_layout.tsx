import React from "react";

// THIRD PARTY
import { Tabs } from "expo-router";

// COMPONENTS
import CustomTabs from "@/components/CustomTabs";

const _layout = () => {
  return (
    <Tabs tabBar={CustomTabs} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default _layout;
