// src/pages/Onboarding/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as s } from '../../styles/Template';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const myPoolData = {
  UserPoolId: 'ap-northeast-1_Frx61b697',
  ClientId: '4mse47h6vme901667vuqb185vo',
};

type Tokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

function logIn(
  name: string,
  password: string,
  poolData: { UserPoolId: string; ClientId: string }
): Promise<Tokens> {
  return new Promise((resolve, reject) => {
    const userPool = new CognitoUserPool(poolData);

    const authDetails = new AuthenticationDetails({
      Username: name,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: name,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        const tokens: Tokens = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };
        //console.log('보내는 Access Token:', tokens.accessToken);

        try {
            await AsyncStorage.setItem('@tokens', JSON.stringify(tokens))
            console.log('토큰 저장 완료:', tokens);
        } catch (e) {
            console.error('토큰 저장 실패:', e);
        }
        resolve(tokens);
      },
      onFailure: (err) => {
        console.error('Cognito 로그인 실패:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        reject({
          code: 'NewPasswordRequired',
          message: '새 비밀번호가 필요합니다.',
          userAttributes,
          requiredAttributes,
        });
      },
    });
  });
}

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 숫자만 추출해서 11자리(010xxxxxxxx)로 제한
  const formatPhone = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '');
    return numbers.slice(0, 11);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhone(text));
  };

  const handleLogin = async () => {
    // 유효성 검사
    if (!phone || !password) {
      Alert.alert('오류', '전화번호와 비밀번호를 입력해주세요');
      return;
    }
    if (phone.length !== 11 || !phone.startsWith('010')) {
      Alert.alert('오류', '올바른 전화번호를 입력해주세요\n(010으로 시작하는 11자리)');
      return;
    }
    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자리 이상입니다');
      return;
    }

    setLoading(true);
    try {
      // Cognito 로그인 (username은 E.164 포맷)
      const username = '+82' + phone.substring(1); // 0101234… → +82101234…
      const tokens = await logIn(username, password, myPoolData);
      console.log('Cognito tokens:', tokens);

      // 백엔드 로그인
      const apiRes = await fetch(
        'http://ec2-15-165-129-83.ap-northeast-2.compute.amazonaws.com:8002/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 백엔드에서 요구한다면 주석 해제
            // Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({
            // 🔧 FIX: 서버가 요구하는 키는 idToken 입니다.
            idToken: tokens.idToken,
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

      const userProfile = await apiRes.json();
      console.log('사용자 프로필:', userProfile);

      // 손주 정보 설정 여부에 따라 분기
      if (userProfile.hasSonjuInfo || userProfile.has_sonju_info) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        navigation.navigate('SignUpSuccess');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      if (error?.code === 'NewPasswordRequired') {
        Alert.alert('알림', '새 비밀번호 설정이 필요합니다.');
      } else {
        Alert.alert('로그인 실패', error?.message || '로그인 중 문제가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container1}>
      <Text style={s.title}>로그인</Text>

      <TextInput
        style={s.input}
        placeholder="01012345678"
        value={phone}
        onChangeText={handlePhoneChange}
        keyboardType="number-pad"
        maxLength={11}
        editable={!loading}
      />

      <TextInput
        style={s.input}
        placeholder="비밀번호를 입력하세요"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity style={s.smallButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>로그인</Text>}
      </TouchableOpacity>
    </View>
  );
}
