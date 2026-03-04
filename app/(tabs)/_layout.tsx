import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import homeFocused from '../../assets/icons/home-solid.png';
import home from '../../assets/icons/home.png';
import cameraFocused from '../../assets/icons/camera-solid.png';
import camera from '../../assets/icons/camera.png';
import mapFocused from '../../assets/icons/map-solid.png';
import map from '../../assets/icons/map.png';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? homeFocused : home} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? cameraFocused : camera} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <Image source={focused ? mapFocused : map} style={{ width: 24, height: 24 }} />
          ),
        }}
      />
    </Tabs>
  );
}
