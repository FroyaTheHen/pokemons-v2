import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import homeFocused from '../../assets/icons/home-solid.png';
import home from '../../assets/icons/home.png';
import cameraFocused from '../../assets/icons/camera-solid.png';
import camera from '../../assets/icons/camera.png';
import mapFocused from '../../assets/icons/map-solid.png';
import map from '../../assets/icons/map.png';
import { useIsDark } from '../../contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import React, { useMemo } from 'react';

export default function TabLayout() {
  const isDark = useIsDark();
  const activeTint = isDark ? '#ffffff' : '#000000';
  const inactiveTint = isDark ? '#666666' : '#888888';
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? homeFocused : home} style={styles.image} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? cameraFocused : camera} style={styles.image} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? mapFocused : map} style={styles.image} />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (isDark: boolean) => {
  const tabBarBg = isDark ? '#1a1a1a' : '#ffffff';
  return StyleSheet.create({
    tabBarStyle: {
      backgroundColor: tabBarBg,
      borderTopColor: isDark ? '#333333' : '#e0e0e0',
    },
    image: {
      width: 24,
      height: 24,
    },
  });
};
