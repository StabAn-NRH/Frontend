// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Image, Dimensions  } from 'react-native';
import ScaledText from '../components/ScaledText';

// 페이지 import
import HomePage from '../pages/HomePage/HomePage';
import DailyQuestPage from '../pages/DailyQuestPage/DailyQuestPage';
import AiChatPage from '../pages/AiChatPage/AiChatPage';
import TodoPage from '../pages/TodoPage/TodoPage';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40; // 좌우 여백 20씩

const Tab = createBottomTabNavigator();

// 탭 아이콘 컴포넌트 (이미지 사용)
const TabIcon = ({
      focused,
      icon,
      label
    }: {
      focused: boolean;
      icon: any;
      label: string
    }) => (
      <View style={styles.tabIconContainer}>
        <Image
          source={icon}
          style={[
            styles.iconImage,
            { tintColor: focused ? '#02BFDC' : '#6B7280' }
          ]}
          resizeMode="contain"
        />
        <ScaledText
          fontSize={18}
          style={[
            styles.tabLabel,
            { color: focused ? '#02BFDC' : '#6B7280' }
          ]}
        >
          {label}
        </ScaledText>
      </View>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require('../../assets/images/홈아이콘.png')}
              label="홈"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={TodoPage}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require('../../assets/images/투두아이콘.png')}
              label="할 일"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={AiChatPage}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require('../../assets/images/채팅아이콘.png')}
              label="채팅"
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ChatMain' as never);
          },
        })}
      />

      <Tab.Screen
        name="Mission"
        component={DailyQuestPage}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require('../../assets/images/미션아이콘.png')}
              label="미션"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
      backgroundColor: '#FFFFFF',
      height: 100,
      width: 385,
      marginBottom: 40,
      paddingTop: 30,
      borderRadius: 30,
      paddingHorizontal: 20,
      marginLeft: 13,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
      position: 'absolute',
      left: '50%',
    },


  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 78,
    height: 80,
  },

  iconImage: {
    width: 28,
    height: 28,
  },

  tabLabel: {
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },
});