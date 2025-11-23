// src/pages/HealthPage/HealthDiaryEntry.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScaledText from '../../components/ScaledText';
import { healthStyles } from '../../styles/Health';

const STORAGE_KEY = '@health_diary_entries';


type Tokens = {
    accessToken: string;
    idToken: string;
    refreshToken: string;
};

async function getStoredTokens(): Promise<Tokens | null> {
    try {
        const json = await AsyncStorage.getItem('@tokens');
        console.log(json);
        if (!json) return null;

        const tokens: Tokens = JSON.parse(json);
        return tokens;
    } catch (e) {
        console.error('토큰 불러오기 실패:', e);
        return null;
    }
}

export default function HealthDiaryEntry() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [entry, setEntry] = useState('');

  // route params에서 날짜 정보 가져오기
  const dateParam = route.params?.date;
  const monthParam = route.params?.month;
  const yearParam = route.params?.year;

  // 현재 날짜를 기본값으로 사용
  const today = new Date();
  const year = yearParam || today.getFullYear();
  const month = monthParam || (today.getMonth() + 1);
  const day = dateParam || today.getDate();

  // YYYY-MM-DD 형식으로 날짜 생성
  const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  useEffect(() => {
    loadEntry();
  }, [currentDate]);

  const loadEntry = async () => {
    console.log(currentDate);
    try {
        const tokens = await getStoredTokens();
        const apiRes = await fetch(
                      `http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/health/memos?requested_date=${currentDate}`,
                      {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${tokens.accessToken}`,
                        },
                      }
                    );
              if (!apiRes.ok) {
                  let errorText = '';
                  try {
                    const ejson = await apiRes.json();
                    errorText = JSON.stringify(ejson);
                    console.error('일지 불러오기 실패 응답(JSON):', ejson);
                  } catch {
                    errorText = await apiRes.text();
                    console.error('일지 불러오기 실패 응답(텍스트):', errorText);
                  }
                  Alert.alert('일지 불러오기 실패', '서버 응답 오류\n' + errorText.slice(0, 200));
                  return;
              }
              console.log(apiRes);
              const response = await apiRes.json();
              setEntry(response);
    } catch (error) {
      console.error('일지 불러오기 실패:', error);
    }
  };

  // 실제 저장 로직 (재사용)
  const saveEntry = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const entries = stored ? JSON.parse(stored) : {};
    entries[currentDate] = entry.trim();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  // 저장 버튼: 알림 표시
  const handleSaveWithAlert = async () => {
    if (!entry.trim()) {
      Alert.alert('알림', '일지 내용을 입력해주세요');
      return;
    }
    try {
      await saveEntry();
      const tokens = await getStoredTokens();
      console.log(currentDate);
      const apiRes = await fetch(
              'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/health/memos',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
                body: JSON.stringify({
                  memo_date: currentDate,
                  memo_text: entry,
                }),
              }
            );
      if (!apiRes.ok) {
          let errorText = '';
          try {
            const ejson = await apiRes.json();
            errorText = JSON.stringify(ejson);
            console.error('일지 저장 실패 응답(JSON):', ejson);
          } catch {
            errorText = await apiRes.text();
            console.error('일지 저장 실패 응답(텍스트):', errorText);
          }
          Alert.alert('일지 저장 실패', '서버 응답 오류\n' + errorText.slice(0, 200));
          return;
      }
      console.log(apiRes);
      Alert.alert('성공', '건강 일지가 저장되었습니다!', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('일지 저장 실패:', error);
      Alert.alert('오류', '일지 저장에 실패했습니다.');
    }
  };

  // 뒤로가기 버튼: 알림 없이 조용히 처리
  const handleBack = async () => {
    try {
      if (entry.trim()) {
        await saveEntry(); // 알림 없이 저장
      }
      navigation.goBack();
    } catch (error) {
      console.error('뒤로가기 중 저장 실패:', error);
      navigation.goBack();
    }
  };

  return (
    <View style={healthStyles.container}>
      {/* 헤더 */}
      <View style={healthStyles.header}>
        <TouchableOpacity
          style={healthStyles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require('../../../assets/images/왼쪽화살표.png')}
            style={healthStyles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <ScaledText fontSize={24} style={healthStyles.headerTitleCenter}>
          건강 요약 일지
        </ScaledText>

        <TouchableOpacity onPress={handleSaveWithAlert} style={healthStyles.saveButton}>
          <ScaledText fontSize={24} style={healthStyles.saveButtonText}>
            저장하기
          </ScaledText>
        </TouchableOpacity>
      </View>

      <View style={healthStyles.content}>
        <View style={healthStyles.entryCard}>
          <ScaledText fontSize={24} style={healthStyles.dateTitle}>
            {currentDate}
          </ScaledText>

          <TextInput
            style={healthStyles.textInput}
            value={entry}
            onChangeText={setEntry}
            placeholder="ex) 어제 콧물이 나고 머리가 아팠어."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  );
}