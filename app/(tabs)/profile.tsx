import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Text, Button, Title, Surface, TextInput, Avatar,
  Card, Divider, Snackbar, ActivityIndicator
} from 'react-native-paper';
import { RootState, AppDispatch } from '../redux/store';
import { login, register, logout, resetAuthError } from '../redux/authSlice';
import { StatusBar } from 'expo-status-bar';

// Extra text styles with various font weights
const textStyle = { fontFamily: 'Inter' };
const boldTextStyle = { fontFamily: 'Inter-Bold' };
const mediumTextStyle = { fontFamily: 'Inter-Medium' };
const lightTextStyle = { fontFamily: 'Inter-Light' };

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, status, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Manipulador para alternar entre login e cadastro
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Limpar campos ao alternar
    setEmail('');
    setPassword('');
    setName('');
    // Limpar mensagens de erro
    dispatch(resetAuthError());
  };
  
  // Manipulador para tentativa de login
  const handleLogin = async () => {
    if (!validateFields()) return;
    
    try {
      const resultAction = await dispatch(login({ email, password }));
      
      if (login.fulfilled.match(resultAction)) {
        setSnackbarMessage('Login realizado com sucesso!');
        setSnackbarVisible(true);
      }
    } catch (err) {
      // Erro tratado no reducer
    }
  };
  
  // Manipulador para tentativa de cadastro
  const handleRegister = async () => {
    if (!validateFields()) return;
    
    try {
      const resultAction = await dispatch(register({ name, email, password }));
      
      if (register.fulfilled.match(resultAction)) {
        setSnackbarMessage('Cadastro realizado com sucesso!');
        setSnackbarVisible(true);
      }
    } catch (err) {
      // Erro tratado no reducer
    }
  };
  
  // Manipulador para logout
  const handleLogout = () => {
    dispatch(logout());
    setSnackbarMessage('Logout realizado com sucesso!');
    setSnackbarVisible(true);
  };
  
  // Validação simples de campos
  const validateFields = () => {
    if (!email || !password) {
      setSnackbarMessage('Por favor, preencha todos os campos.');
      setSnackbarVisible(true);
      return false;
    }
    
    if (!isLogin && !name) {
      setSnackbarMessage('Por favor, informe seu nome para cadastro.');
      setSnackbarVisible(true);
      return false;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage('Por favor, insira um email válido.');
      setSnackbarVisible(true);
      return false;
    }
    
    // Validação básica de senha
    if (password.length < 6) {
      setSnackbarMessage('A senha deve ter pelo menos 6 caracteres.');
      setSnackbarVisible(true);
      return false;
    }
    
    return true;
  };
  
  // Determinar a primeira letra do nome para o avatar
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="auto" />
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Title style={{...styles.title, ...boldTextStyle}}>Perfil</Title>
          </View>
        </View>
      </Surface>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {user && token ? (
          // Tela de perfil quando logado
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>              <Avatar.Text 
                size={80} 
                label={getInitials(user.name)} 
                style={styles.avatar}
              />
              <Title style={{...styles.userName, ...boldTextStyle}}>{user.name}</Title>
              <Text style={{...styles.userEmail, ...textStyle}}>{user.email}</Text>
              
              <Divider style={styles.divider} />
              
              <Text style={{...styles.infoText, ...textStyle}}>
                Seu perfil está ativo e você pode criar alertas para ajudar sua comunidade.
              </Text>
                <Button 
                mode="contained" 
                onPress={handleLogout}
                style={styles.logoutButton}
                icon="logout"
              >
                <Text>Fazer Logout</Text>
              </Button>
            </Card.Content>
          </Card>
        ) : (
          // Tela de login/cadastro quando não logado
          <Card style={styles.authCard}>
            <Card.Content>              <Title style={{...styles.cardTitle, ...mediumTextStyle}}>
                {isLogin ? 'Login' : 'Cadastro'}
              </Title>
              
              {!isLogin && (
                <TextInput
                  label="Nome"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoCapitalize="words"
                />
              )}
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
                {error && (
                <Text style={{...styles.errorText, ...textStyle}}>
                  {error}
                </Text>
              )}
                <Button 
                mode="contained" 
                onPress={isLogin ? handleLogin : handleRegister}
                loading={status === 'loading'}
                disabled={status === 'loading'}
                style={styles.authButton}
              >
                <Text style={{color: 'white'}}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
              </Button>
              
              <Button 
                mode="text" 
                onPress={toggleAuthMode}
                style={styles.toggleButton}
              >
                <Text>{isLogin 
                  ? 'Não tem uma conta? Cadastre-se' 
                  : 'Já tem uma conta? Faça login'}</Text>
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={3000}
      >
        <Text>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#006400',
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTextContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  authCard: {
    marginTop: 16,
  },
  cardTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    fontFamily: 'Inter',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  authButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  toggleButton: {
    marginTop: 16,
  },
  profileCard: {
    marginTop: 16,
  },
  profileContent: {
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#006400',
  },
  userName: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  userEmail: {
    marginBottom: 16,
    fontSize: 16,
    opacity: 0.7,
    fontFamily: 'Inter',
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  logoutButton: {
    width: '100%',
  },
});
