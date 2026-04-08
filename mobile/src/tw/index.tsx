import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { BlurView as ExpoBlurView } from "expo-blur";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator as RNActivityIndicator,
  Image as RNImage,
  Switch as RNSwitch,
  StyleSheet,
} from "react-native";


// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
  return useCssElement(RouterLink, props, { className: "style" });
};

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

// TouchableOpacity
export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & { className?: string }
) => {
  return useCssElement(RNTouchableOpacity, props, { className: "style" });
};
TouchableOpacity.displayName = "CSS(TouchableOpacity)";

// ActivityIndicator
export const ActivityIndicator = (
  props: React.ComponentProps<typeof RNActivityIndicator> & { className?: string }
) => {
  return useCssElement(RNActivityIndicator, props, { className: "style" });
};
ActivityIndicator.displayName = "CSS(ActivityIndicator)";

// LinearGradient
export const LinearGradient = (
  props: React.ComponentProps<typeof ExpoLinearGradient> & { className?: string }
) => {
  return useCssElement(ExpoLinearGradient, props, { className: "style" });
};
LinearGradient.displayName = "CSS(LinearGradient)";

// BlurView
export const BlurView = (
  props: React.ComponentProps<typeof ExpoBlurView> & { className?: string }
) => {
  return useCssElement(ExpoBlurView, props, { className: "style" });
};
BlurView.displayName = "CSS(BlurView)";

// Image
export const Image = (
  props: React.ComponentProps<typeof RNImage> & { className?: string }
) => {
  return useCssElement(RNImage, props, { className: "style" });
};
Image.displayName = "CSS(Image)";

// Switch
export const Switch = (
  props: React.ComponentProps<typeof RNSwitch> & { className?: string }
) => {
  return useCssElement(RNSwitch, props, { className: "style" });
};
Switch.displayName = "CSS(Switch)";
