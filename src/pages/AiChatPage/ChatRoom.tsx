// src/pages/HomePage/ChatRoom.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { ChatStackParamList } from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatRoomNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatRoom'>;
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
/* 로그아웃에 사용. 저장한 토큰 삭제(보안 때문에 필수적)
export async function clearTokens(): Promise<void> {
  try {
    await AsyncStorage.removeItem('@tokens');
    console.log('토큰 삭제 완료');
  } catch (e) {
    console.error('토큰 삭제 실패:', e);
  }
}
*/

const ChatRoom = () => {
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const { currentChat, addMessage, setAllChats } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  /*
  useEffect(() => {
    const fetchTokensAndChats = async () => {
        try {
            const tokens = await getStoredTokens();
            //setTokens(storedTokens);


            const apiRes = await fetch(
                'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/chats/lists/1',
                { // 임시 파라미터(1번방)
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    // 백엔드에서 요구한다면 주석 해제
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                }
            );

            if (!apiRes.ok) {
                const text = await apiRes.text();
                console.error('서버 오류:', text);
                Alert.alert('오류', '서버 응답 오류');
            }

            console.log(apiRes);
            const chatRecord = await apiRes.json();

            const convertedChats: Chat[] = chatData.map((item: any) => ({
                 id: item.chat_list_num.toString(),
                 title: item.message,
                 date: new Date(item.chat_date),
                 messages: item.message,
                 prompt: "reliable"      // 임시
            }));


        } catch (e) {
          console.error('데이터 불러오기 실패:', e);
        } finally {
          setLoading(false);
        }
    };
    fetchTokensAndChats();
  }, []);

    if (loading) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>로딩 중...</Text>
          </View>
        );
    }

  */
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);

    // 사용자 메시지 추가
    addMessage({ role: 'user', content: message });

    // 스크롤을 맨 아래로
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // TODO: ChatGPT API 호출
    setTimeout( async () => {
        const tokens = await getStoredTokens();
        const apiRes = await fetch(
                'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/chats/messages',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    // 백엔드에서 요구한다면 주석 해제
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                  body: JSON.stringify({
                    // 🔧 FIX: 서버가 요구하는 키는 idToken 입니다.
                    message: message,
                    chat_list_num: 2, //임시
                    enable_tts: false,
                  }),
                }
            );

        if (!apiRes.ok) {
            let errorText = '';
            try {
              const ejson = await apiRes.json();
              errorText = JSON.stringify(ejson);
              console.error('채팅방 실패 응답(JSON):', ejson);
            } catch {
              errorText = await apiRes.text();
              console.error('채팅방 실패 응답(텍스트):', errorText);
            }
            Alert.alert('채팅방 실패', '서버 응답 오류\n' + errorText.slice(0, 200));
            return;
        }
        const data = await apiRes.json();
        const aiMessage = data.ai?.message || '응답이 없습니다.';
        addMessage({
          role: 'assistant',
          content: aiMessage,
        });
      setIsLoading(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <Header
        title="돌쇠"
        showBack={true}
        onStar={() => navigation.navigate('PromptSettings')}
        onMenu={() => navigation.navigate('ChatList')}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* TODO: 캐릭터 이미지 에셋 추가 */}
        <View style={styles.characterHeader}>
          <View style={styles.characterPlaceholder} />
        </View>

        {currentChat?.messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            {/* TODO: 로딩 인디케이터 추가 */}
          </View>
        )}
      </ScrollView>

      <ChatInput
        onSend={handleSendMessage}
        onVoiceClick={() => navigation.navigate('VoiceChat')}
        onAttachClick={() => {
          // TODO: 파일 첨부 기능
        }}
        disabled={isLoading}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9F2F5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  characterHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  characterPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B8E6EA',
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default ChatRoom;