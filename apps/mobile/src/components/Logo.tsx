import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// The official Unö wordmark. Always render the brand asset — never re-typeset
// "Unö" as plain text where the logo belongs, so the red umlaut dots and the
// locked colours are always correct. Assets live in apps/mobile/assets/brand.
const SOURCES = {
  primary: require('../../assets/brand/uno-wordmark-primary-512.png'),
  white: require('../../assets/brand/uno-wordmark-white-512.png'),
} as const;

const ASPECT = 670 / 285; // wordmark viewBox ratio

export function Logo({
  height = 28,
  variant = 'primary',
  style,
}: {
  height?: number;
  variant?: keyof typeof SOURCES;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={SOURCES[variant]}
      style={[{ height, width: height * ASPECT }, style]}
      resizeMode="contain"
      accessibilityLabel="Unö"
    />
  );
}
