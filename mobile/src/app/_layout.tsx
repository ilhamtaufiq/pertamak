import "../global.css";
import { Stack } from "expo-router";
import { QueryProvider } from "../providers/QueryProvider";
import { StatusBar } from "expo-status-bar";
import React from 'react';

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Group: Initial Login/Signup flows */}
        <Stack.Screen name="(auth)" />
        
        {/* Root Transition: Redirects to tabs after login */}
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        
        {/* Main Application: Featured-based Tab system */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </QueryProvider>
  );
}
