// src/navigation/MainNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import SettingsPage from '../pages/HomePage/SettingsPage';
import NotificationPage from '../pages/HomePage/NotificationPage';
import HealthPage from '../pages/HealthPage/HealthPage';
import MedicationSettings from '../pages/HealthPage/MedicationSettings';
import HealthDiaryEntry from '../pages/HealthPage/HealthDiaryEntry';
import HealthDiaryList from '../pages/HealthPage/HealthDiaryList';
import ManualMedicationEntry from '../pages/HealthPage/ManualMedicationEntry';
import PrescriptionOCR from '../pages/HealthPage/PrescriptionOCR';
import MedicationResultConfirm from '../pages/HealthPage/MedicationResultConfirm';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 메인 탭 네비게이터 (홈, 할일, 채팅, 미션) */}
      <Stack.Screen
        name="MainTab"
        component={MainTabNavigator}
      />

      {/* 홈에서만 접근 가능한 페이지들 - 탭바 숨김 */}
      <Stack.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationPage}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />

      {/* 건강 관련 페이지들 */}
      <Stack.Screen
        name="Health"
        component={HealthPage}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="MedicationSettings"
        component={MedicationSettings}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="HealthDiaryEntry"
        component={HealthDiaryEntry}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="HealthDiaryList"
        component={HealthDiaryList}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />

      {/* 복약 관련 추가 페이지들 */}
      <Stack.Screen
        name="ManualMedicationEntry"
        component={ManualMedicationEntry}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="PrescriptionOCR"
        component={PrescriptionOCR}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="MedicationResultConfirm"
        component={MedicationResultConfirm}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}