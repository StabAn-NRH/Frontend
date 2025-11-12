// src/pages/HomePage/HomePage.tsx
import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScaledText from '../../components/ScaledText';
import { styles } from '../../styles/Home';
import { useMission } from '../../contexts/MissionContext';

function HomePage() {
  const navigation = useNavigation<any>();
  const { totalPoints } = useMission();

  const quickMenus = [
    {
      id: 1,
      title: '건강',
      image: require('../../../assets/images/건강아이콘.png'),
      onPress: () => navigation.navigate('Health'),
    },
    {
      id: 2,
      title: '경제',
      image: require('../../../assets/images/경제아이콘.png'),
      onPress: () => {}, // TODO
    },
    {
      id: 3,
      title: '활동',
      image: require('../../../assets/images/배움아이콘.png'),
      onPress: () => {}, // TODO
    },
  ];

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/배경.png')} style={styles.backgroundImage} resizeMode="cover" />
      <Image source={require('../../../assets/images/배경2.png')} style={styles.backgroundImage2} resizeMode="cover" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 퀵 메뉴 */}
        <View style={styles.quickMenuContainer}>
          {quickMenus.map(menu => (
            <TouchableOpacity key={menu.id} style={styles.quickMenu} onPress={menu.onPress}>
              <Image source={menu.image} style={styles.menuIcon} resizeMode="contain" />
              <ScaledText fontSize={18} style={styles.menuTitle}>{menu.title}</ScaledText>
            </TouchableOpacity>
          ))}
        </View>

        {/* 캐릭터 영역 */}
        <View style={styles.characterSection}>
          <ScaledText fontSize={28} style={styles.characterName}>돌쇠</ScaledText>

          <View style={styles.characterContainer}>
            <Image
              source={require('../../../assets/images/sonjusmile.png')}
              style={styles.characterImage}
              resizeMode="contain"
            />

            {/* 메시지 아이콘 */}
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => navigation.navigate('ChatMain')}
            >
              <Image
                source={require('../../../assets/images/말풍선아이콘.png')}
                style={styles.messageIcon}
                resizeMode="contain"
              />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* 포인트 영역 */}
          <View style={styles.pointContainer}>
            <View style={styles.pointSection}>
              <ScaledText fontSize={24} style={styles.pointText}>
                {totalPoints} 포인트
              </ScaledText>
              <Image source={require('../../../assets/images/코인.png')} style={styles.Icons} />
            </View>

            <TouchableOpacity style={styles.pointSection}>
              <ScaledText fontSize={18} style={styles.pointButton}>꾸미기</ScaledText>
              <Image source={require('../../../assets/images/오른쪽화살표.png')} style={styles.Icons} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 좌측 고정 버튼들 */}
      <View style={styles.leftButtonsContainer}>
        <TouchableOpacity
          style={styles.leftButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Image source={require('../../../assets/images/설정아이콘.png')} style={styles.buttonIcon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leftButton}
          onPress={() => navigation.navigate('Notification')}
        >
          <Image source={require('../../../assets/images/알림아이콘.png')} style={styles.buttonIcon} resizeMode="contain" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HomePage;
