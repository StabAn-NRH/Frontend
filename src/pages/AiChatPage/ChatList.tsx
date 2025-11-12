import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChat } from '../../contexts/ChatContext';
import { Chat } from '../../types/chat';
import { ChatStackParamList } from '../../types/navigation';
import { ChatStyles } from '../../styles/ChatStyles';
import { colors } from '../../styles/colors';
import ScaledText from '../../components/ScaledText';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatListNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

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
const ChatList = () => {

  const navigation = useNavigation<ChatListNavigationProp>();
  const { chats, selectChat, deleteChats } = useChat();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  //const [tokens, setTokens] = useState<Tokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  // 데이터 불러오기
  useEffect(() => {
      const fetchTokensAndChats = async () => {
          try {
              const tokens = await getStoredTokens();
              //setTokens(storedTokens);


              const apiRes = await fetch(
                  'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/chats/lists',
                  {
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
              const chatData = await apiRes.json();

              const convertedChats: Chat[] = chatData.map((item: any) => ({
                  id: item.chat_list_num.toString(),
                  title: item.last_message,
                  date: new Date(item.last_date),
                  messages: [],
                  prompt: "reliable"      // 임시
              }));

              setAllChats(convertedChats);

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
  const handleChatPress = (chat: Chat) => {
    if (isSelectionMode) {
      toggleSelection(chat.id);
    } else {
      selectChat(chat.id);
      navigation.navigate('ChatRoom');
    }
  };

  const toggleSelection = (chatId: string) => {
    setSelectedItems((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
    );
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      Alert.alert('알림', '삭제할 항목을 선택해주세요');
      return;
    }

    Alert.alert('삭제 확인', `${selectedItems.length}개의 대화를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteChats(selectedItems);
          setSelectedItems([]);
          setIsSelectionMode(false);
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '어제';
    if (days < 7) return `${days}일 전`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <TouchableOpacity
        style={[ChatStyles.chatListItem, isSelected && ChatStyles.chatListItemSelected]}
        onPress={() => handleChatPress(item)}
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleSelection(item.id);
        }}
        activeOpacity={0.7}
      >
        <View style={ChatStyles.chatListContent}>
          <Text style={ChatStyles.chatListTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={ChatStyles.chatListDate}>{formatDate(item.date)}</Text>
        </View>
        {isSelectionMode && (
          <View style={[ChatStyles.checkbox, isSelected && ChatStyles.checkboxSelected]}>
            {isSelected && <Icon name="checkmark" size={16} color={colors.white} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={ChatStyles.container}>
      <View style={ChatStyles.container}>
      {/* 헤더 */}
      <View style={ChatStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ChatStyles.headerButton}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={ChatStyles.headerTitle}>채팅 목록</Text>
        {isSelectionMode ? (
          <TouchableOpacity style={ChatStyles.headerButton} onPress={handleDelete}>
            <Text style={ChatStyles.headerButtonPrimary}>삭제</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={ChatStyles.headerButton} onPress={() => setIsSelectionMode(true)}>
            <Text style={ChatStyles.headerButtonPrimary}>선택</Text>
          </TouchableOpacity>
        )}
      </View>

      {chats.length === 0 ? (
        <View style={ChatStyles.emptyContainer}>
          <Icon name="chatbubbles-outline" size={64} color={colors.border} />
          <Text style={ChatStyles.emptyText}>채팅 내역이 없습니다</Text>
          <Text style={ChatStyles.emptySubtext}>손주와 새로운 대화를 시작해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={allChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {isSelectionMode && (
        <View style={styles.cancelButtonContainer}>
          <TouchableOpacity
            style={ChatStyles.secondaryButton}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedItems([]);
            }}
          >
            <Text style={ChatStyles.secondaryButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default ChatList;