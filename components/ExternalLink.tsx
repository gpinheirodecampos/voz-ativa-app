import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

type Props = {
  href: string;
  style?: any;
  children?: React.ReactNode;
  [key: string]: any;
};

export function ExternalLink({ href, children, style, ...rest }: Props) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      // Em plataformas nativas, use o browser interno
      await openBrowserAsync(href);
    } else {
      // Na web, abra em uma nova aba
      window.open(href, '_blank');
    }
  };
  
  return (
    <TouchableOpacity
      style={style}
      onPress={handlePress}
      {...rest}
    >
      <View>
        {children}
      </View>
    </TouchableOpacity>
  );
}
