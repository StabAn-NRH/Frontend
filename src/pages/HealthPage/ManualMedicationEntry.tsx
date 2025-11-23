// src/pages/HealthPage/ManualMedicationEntry.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScaledText from '../../components/ScaledText';
import { healthStyles } from '../../styles/Health';

type Tokens = {
    accessToken: string;
    idToken: string;
    refreshToken: string;
};

async function getStoredTokens(): Promise<Tokens | null> {
    try {
        const json = await AsyncStorage.getItem('@tokens');
        //console.log(json);
        if (!json) return null;

        const tokens: Tokens = JSON.parse(json);
        return tokens;
    } catch (e) {
        console.error('토큰 불러오기 실패:', e);
        return null;
    }
}

const MEDICATION_STORAGE_KEY = '@medication_data';

interface TimeSlot {
  time: string;
  label: string;
  medications: { id: string; name: string; checked: boolean; frequency?: string; days?: string; startDate?: string }[];
}

export default function ManualMedicationEntry() {
  const navigation = useNavigation<any>();

  const [medicationName, setMedicationName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [days, setDays] = useState('');
  const [startDate, setStartDate] = useState('');

  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencyOptions = ['1', '2', '3', '4'];
  const daysOptions = Array.from({ length: 31 }, (_, i) => String(i + 1));

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    setStartDate(formatDate(new Date()));
  }, []);

  const handleFrequencySelect = (freq: string) => {
    setFrequency(freq);
    setShowFrequencyPicker(false);
  };

  const handleDaysSelect = (selectedDays: string) => {
    setDays(selectedDays);
    setShowDaysPicker(false);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = parseDate(startDate || formatDate(new Date()));
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setStartDate(formatDate(currentDate));
  };

  const handleDateConfirm = () => {
    if (!startDate) {
      setStartDate(formatDate(new Date()));
    }
    setShowDatePicker(false);
  };

  const getTimeSlots = (freq: string): { time: string; label: string }[] => {
    const frequency = parseInt(freq);
    if (frequency === 1) return [{ time: '오전 8시', label: '아침' }];
    if (frequency === 2) return [
      { time: '오전 8시', label: '아침' },
      { time: '오후 6시', label: '저녁' }
    ];
    if (frequency === 3) return [
      { time: '오전 8시', label: '아침' },
      { time: '오후 12시', label: '점심' },
      { time: '오후 6시', label: '저녁' }
    ];
    return [
      { time: '오전 8시', label: '아침' },
      { time: '오후 12시', label: '점심' },
      { time: '오후 6시', label: '저녁' },
      { time: '오후 10시', label: '취침' }
    ];
  };

  const handleSave = async () => {
    if (!medicationName || !frequency || !days || !startDate) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(MEDICATION_STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};

      const start = parseDate(startDate);
      const daysCount = parseInt(days);
      const timeSlots = getTimeSlots(frequency);

      for (let i = 0; i < daysCount; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = formatDate(currentDate).replace(/\//g, '-');

        if (!existingData[dateKey]) {
          existingData[dateKey] = [];
        }

        timeSlots.forEach(newSlot => {
          let targetSlot = existingData[dateKey].find((slot: TimeSlot) => slot.time === newSlot.time);

          if (!targetSlot) {
            targetSlot = {
              time: newSlot.time,
              label: newSlot.label,
              medications: []
            };
            existingData[dateKey].push(targetSlot);
          }

          const medId = `${dateKey}-${newSlot.time}-${medicationName}-${Date.now()}-${Math.random()}`;
          const exists = targetSlot.medications.some(m => m.name === medicationName && m.startDate === startDate);

          if (!exists) {
            targetSlot.medications.push({
              id: medId,
              name: medicationName,
              checked: false,
              frequency: frequency,
              days: days,
              startDate: startDate,
            });
          }
        });

        existingData[dateKey].sort((a: TimeSlot, b: TimeSlot) => {
          const timeOrder = ['오전 8시', '오후 12시', '오후 6시', '오후 10시'];
          return timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time);
        });
      }

      await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(existingData));
      const tokens = await getStoredTokens();
      const apiRes = await fetch(
                'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/health/medicine',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                  body: JSON.stringify({
                    medicine_name: medicationName,
                    medicine_daily: frequency,
                    medicine_period: days,
                    medicine_date: startDate,
                  }),
                }
              );
        if (!apiRes.ok) {
            let errorText = '';
            try {
              const ejson = await apiRes.json();
              errorText = JSON.stringify(ejson);
              console.error('복약 루틴 저장 실패 응답(JSON):', ejson);
            } catch {
              errorText = await apiRes.text();
              console.error('복약 루틴 저장 실패 응답(텍스트):', errorText);
            }
            Alert.alert('복약 루틴 저장 실패', '서버 응답 오류\n' + errorText.slice(0, 200));
            return;
        }
        console.log(apiRes);
      navigation.goBack();
    } catch (error) {
      console.error('복약 데이터 저장 실패:', error);
    }
  };

  return (
    <View style={healthStyles.container}>
      <View style={healthStyles.header}>
        <TouchableOpacity style={healthStyles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/images/왼쪽화살표.png')}
            style={healthStyles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <ScaledText fontSize={24} style={healthStyles.headerTitle}>
          복약 알림 설정
        </ScaledText>
      </View>

      <ScrollView contentContainerStyle={healthStyles.scrollContent}>
        <View style={healthStyles.manualEntryContainer}>
          <ScaledText fontSize={24} style={healthStyles.sectionTitle}>
            직접 입력
          </ScaledText>

          <View style={healthStyles.inputCard}>
            <ScaledText fontSize={18} style={healthStyles.inputLabel}>
              약 이름
            </ScaledText>
            <TextInput
              style={healthStyles.input}
              placeholder="약 이름을 입력하세요"
              placeholderTextColor="#999"
              value={medicationName}
              onChangeText={setMedicationName}
            />
          </View>

          <TouchableOpacity
            style={healthStyles.inputCard}
            onPress={() => setShowFrequencyPicker(true)}
          >
            <ScaledText fontSize={18} style={healthStyles.inputLabel}>
              투약 횟수 (1일)
            </ScaledText>
            <View style={healthStyles.input}>
              <ScaledText fontSize={18} style={frequency ? healthStyles.inputText : healthStyles.inputPlaceholder}>
                {frequency ? `${frequency}회` : '선택하세요'}
              </ScaledText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={healthStyles.inputCard}
            onPress={() => setShowDaysPicker(true)}
          >
            <ScaledText fontSize={18} style={healthStyles.inputLabel}>
              투약 일수
            </ScaledText>
            <View style={healthStyles.input}>
              <ScaledText fontSize={18} style={days ? healthStyles.inputText : healthStyles.inputPlaceholder}>
                {days ? `${days}일` : '선택하세요'}
              </ScaledText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={healthStyles.inputCard}
            onPress={() => {
              if (!startDate) setStartDate(formatDate(new Date()));
              setShowDatePicker(true);
            }}
          >
            <ScaledText fontSize={18} style={healthStyles.inputLabel}>
              투약 시작일
            </ScaledText>
            <View style={healthStyles.input}>
              <ScaledText fontSize={18} style={startDate ? healthStyles.inputText : healthStyles.inputPlaceholder}>
                {startDate || '선택하세요'}
              </ScaledText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={healthStyles.completeButton} onPress={handleSave}>
            <ScaledText fontSize={20} style={healthStyles.completeButtonText}>
              저장하기
            </ScaledText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 투약 횟수 선택 모달 - 수정됨 */}
      <Modal visible={showFrequencyPicker} transparent animationType="fade" onRequestClose={() => setShowFrequencyPicker(false)}>
        <TouchableOpacity
          style={healthStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrequencyPicker(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={healthStyles.pickerModalContent}>
              <ScaledText fontSize={24} style={healthStyles.modalTitle}>
                투약 횟수 선택
              </ScaledText>
              <ScrollView style={healthStyles.pickerList}>
                {frequencyOptions.map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={healthStyles.pickerItem}
                    onPress={() => handleFrequencySelect(freq)}
                  >
                    <ScaledText fontSize={20} style={healthStyles.pickerItemText}>
                      {freq}회
                    </ScaledText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={healthStyles.pickerCancelButton}
                onPress={() => setShowFrequencyPicker(false)}
              >
                <ScaledText fontSize={18} style={healthStyles.pickerCancelText}>
                  취소
                </ScaledText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 투약 일수 선택 모달 - 수정됨 */}
      <Modal visible={showDaysPicker} transparent animationType="fade" onRequestClose={() => setShowDaysPicker(false)}>
        <TouchableOpacity
          style={healthStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDaysPicker(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={healthStyles.pickerModalContent}>
              <ScaledText fontSize={24} style={healthStyles.modalTitle}>
                투약 일수 선택
              </ScaledText>
              <ScrollView style={healthStyles.pickerList}>
                {daysOptions.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={healthStyles.pickerItem}
                    onPress={() => handleDaysSelect(day)}
                  >
                    <ScaledText fontSize={20} style={healthStyles.pickerItemText}>
                      {day}일
                    </ScaledText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={healthStyles.pickerCancelButton}
                onPress={() => setShowDaysPicker(false)}
              >
                <ScaledText fontSize={18} style={healthStyles.pickerCancelText}>
                  취소
                </ScaledText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 날짜 선택 모달 - 수정됨 */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <TouchableOpacity
          style={healthStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={healthStyles.datePickerModalContent}>
              <ScaledText fontSize={24} style={healthStyles.modalTitle}>
                투약 시작일 선택
              </ScaledText>
              <View style={healthStyles.datePickerContainer}>
                <TouchableOpacity
                  style={healthStyles.dateArrowButton}
                  onPress={() => handleDateChange('prev')}
                >
                  <Image
                    source={require('../../../assets/images/왼쪽화살표꼬리X.png')}
                    style={healthStyles.datePickerArrow}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <ScaledText fontSize={24} style={healthStyles.datePickerText}>
                  {startDate || formatDate(new Date())}
                </ScaledText>
                <TouchableOpacity
                  style={healthStyles.dateArrowButton}
                  onPress={() => handleDateChange('next')}
                >
                  <Image
                    source={require('../../../assets/images/오른쪽화살표꼬리X.png')}
                    style={healthStyles.datePickerArrow}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <View style={healthStyles.modalButtons}>
                <TouchableOpacity
                  style={healthStyles.modalCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <ScaledText fontSize={18} style={healthStyles.modalCancelText}>
                    취소
                  </ScaledText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={healthStyles.modalConfirmButton}
                  onPress={handleDateConfirm}
                >
                  <ScaledText fontSize={18} style={healthStyles.modalConfirmText}>
                    확인
                  </ScaledText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}