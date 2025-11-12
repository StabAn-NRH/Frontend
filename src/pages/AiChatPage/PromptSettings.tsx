// src/pages/HomePage/PromptSettings.tsx
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChat } from '../../contexts/ChatContext';
import { PromptType } from '../../types/chat';
import { promptConfigs } from '../../utils/promptHelper';
import { ChatStackParamList } from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
type PromptSettingsNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'PromptSettings'>;
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


const PromptSettings = () => {
  const navigation = useNavigation<PromptSettingsNavigationProp>();
  const { currentPrompt, setCurrentPrompt } = useChat();

  // 임시로 선택된 프롬프트를 저장하는 상태
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>(currentPrompt);

  const handleSelectPrompt = (promptType: PromptType) => {
    // 임시 상태만 업데이트 (실제 저장은 하지 않음)
    setSelectedPrompt(promptType);
  };


  /*const apiRes = await fetch(
          'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
               // 백엔드에서 요구한다면 주석 해제
               Authorization: `Bearer ${tokens.accessToken}`,
            },
            body: JSON.stringify({
              // 🔧 FIX: 서버가 요구하는 키는 idToken 입니다.
              idToken: tokens.idToken,
            }),
          }
        );
*/
  const handleSave = async () => {
    // 저장 버튼을 눌렀을 때만 실제로 프롬프트를 저장
    setCurrentPrompt(selectedPrompt);

    const tokens = await getStoredTokens();
    const apiRes = await fetch(
        'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/ai/preferences',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // 백엔드에서 요구한다면 주석 해제
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({
            personality: selectedPrompt,
          }),
        }
    );

    if (!apiRes.ok) {
        let errorText = '';
        try {
          const ejson = await apiRes.json();
          errorText = JSON.stringify(ejson);
          console.error('로그인 실패 응답(JSON):', ejson);
        } catch {
          errorText = await apiRes.text();
          console.error('로그인 실패 응답(텍스트):', errorText);
        }
        Alert.alert('로그인 실패', '서버 응답 오류\n' + errorText.slice(0, 200));
        return;
    }


    navigation.goBack();
  };

  const promptTypes: PromptType[] = ['friendly', 'active', 'pleasant', 'reliable'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프롬프트 설정</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* TODO: 캐릭터 이미지 에셋 추가 */}
        <View style={styles.characterContainer}>
          <View style={styles.characterPlaceholder} />
        </View>

        <Text style={styles.description}>
          프롬프트를 고르면{'\n'}손주의 목소리를 들을 수 있어요.
        </Text>

        <View style={styles.promptList}>
          {promptTypes.map((type) => {
            const config = promptConfigs[type];
            const isSelected = selectedPrompt === type;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.promptItem, isSelected && styles.promptItemSelected]}
                onPress={() => handleSelectPrompt(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.promptLabel, isSelected && styles.promptLabelSelected]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#D9F2F5',
    borderBottomWidth: 1,
    borderBottomColor: '#B8E6EA',
  },
  backButton: {
    padding: 8,
    width: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D4550',
  },
  saveButton: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#02BFDC',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  characterPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#B8E6EA',
  },
  description: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D4550',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  promptList: {
    paddingHorizontal: 32,
    gap: 16,
  },
  promptItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B8E6EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  promptItemSelected: {
    backgroundColor: '#E8F7FA',
    borderColor: '#02BFDC',
  },
  promptLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D4550',
    textAlign: 'center',
  },
  promptLabelSelected: {
    color: '#02BFDC',
    fontWeight: '600',
  },
});

export default PromptSettings;
