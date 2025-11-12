    // src/navigation/RootNavigator.tsx
    import React, { useState, useEffect } from 'react';
    import { createNativeStackNavigator } from '@react-navigation/native-stack';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { ActivityIndicator, View } from 'react-native';

    import OnboardingNavigator from './OnboardingNavigator';

    import MainNavigator from './MainNavigator';

    import MainTabNavigator from '../navigation/MainTabNavigator';

    // Chat Pages
    import ChatMainPage from '../pages/AiChatPage/ChatMain';
    import ChatRoomPage from '../pages/AiChatPage/ChatRoom';
    import VoiceChatPage from '../pages/AiChatPage/VoiceChat';
    import PromptSettingsPage from '../pages/AiChatPage/PromptSettings';
    import ChatListPage from '../pages/AiChatPage/ChatList';

    // Mission Pages
    import DailyQuestPage from '../pages/DailyQuestPage/DailyQuestPage';
    import MissionChatPage from '../pages/DailyQuestPage/MissionChatPage';


    const Stack = createNativeStackNavigator();

    //  디버깅 모드: true로 설정하면 온보딩 건너뛰고 바로 메인으로 이동
    const DEBUG_MODE = false; // ← 디버깅 중엔 true

  export default function RootNavigator() {
     /*
    if (DEBUG_MODE) {
      // 디버그 모드일 땐 비동기 체크/AsyncStorage 전부 생략하고 바로 메인으로
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          { 필요하면 다른 스크린 추가 }
          <Stack.Screen name="ChatMain" component={ChatMainPage} />
          <Stack.Screen name="ChatRoom" component={ChatRoomPage} />
          <Stack.Screen name="VoiceChat" component={VoiceChatPage} />
          <Stack.Screen name="PromptSettings" component={PromptSettingsPage} />
          <Stack.Screen name="ChatList" component={ChatListPage} />
          <Stack.Screen name="DailyQuest" component={DailyQuestPage} />
          <Stack.Screen name="MissionChat" component={MissionChatPage} />
        </Stack.Navigator>
      );
    }

    // ↓↓↓ 여기부터는 일반 모드 (DEBUG_MODE=false일 때만 실행)
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
          setIsLoggedIn(!!token && hasCompletedOnboarding === 'true');
        } catch (e) {
          console.error('로그인 상태 확인 실패:', e);
        } finally {
          setIsLoading(false);
        }
      })();
    }, []);
````
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#02BFDC" />
        </View>
      );
    }
*/
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {true ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="ChatMain" component={ChatMainPage} />
            <Stack.Screen name="ChatRoom" component={ChatRoomPage} />
            <Stack.Screen name="VoiceChat" component={VoiceChatPage} />
            <Stack.Screen name="PromptSettings" component={PromptSettingsPage} />
            <Stack.Screen name="ChatList" component={ChatListPage} />
            <Stack.Screen name="DailyQuest" component={DailyQuestPage} />
            <Stack.Screen name="MissionChat" component={MissionChatPage} />
          </>
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </Stack.Navigator>
    );
  }