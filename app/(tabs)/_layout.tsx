import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, CreditCard as Edit3, FileText, Crown, Settings } from 'lucide-react-native';
import { Platform, useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: 'rgba(15, 10, 25, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          shadowColor: '#D97706',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          display: 'none',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="home" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="plus-circle" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="rewrite"
        options={{
          title: 'Rewrite',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="edit" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: 'Features',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="lightbulb-o" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="star" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={focused ? ['#D97706', '#F59E0B'] : ['rgba(217, 119, 6, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={{
                padding: 8,
                borderRadius: 12,
                opacity: focused ? 1 : 0.7,
                borderWidth: focused ? 1 : 0,
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <FontAwesome name="gear" size={24} color={color} />
            </LinearGradient>
          ),
        }}
      />
    </Tabs>
  );
}