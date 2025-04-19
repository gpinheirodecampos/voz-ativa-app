import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Text, Card, Button, Title, Surface } from 'react-native-paper';
import { RootState } from '../redux/store';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

// Text styles with various font weights
const textStyle = { fontFamily: 'Inter' };
const boldTextStyle = { fontFamily: 'Inter-Bold' };
const mediumTextStyle = { fontFamily: 'Inter-Medium' };
const semiBoldTextStyle = { fontFamily: 'Inter-SemiBold' };

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Title style={{...styles.title, ...boldTextStyle}}>Home</Title>
          </View>
        </View>
      </Surface>
        <ScrollView style={styles.content}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={mediumTextStyle}>
              {user 
                ? `Bem-vindo, ${user.name}!` 
                : 'Bem-vindo ao Voz Ativa!'}
            </Title>
            <Text style={textStyle}>
              {user 
                ? 'Use nosso aplicativo para reportar problemas na sua cidade.' 
                : 'Faça login para começar a reportar problemas na sua cidade.'}
            </Text>
          </Card.Content>
          {!user && (
            <Card.Actions>
              <Button 
                mode="contained"
                onPress={() => router.push('/profile')}
              >
                <Text style={{color: 'white'}}>Fazer Login</Text>
              </Button>
            </Card.Actions>
          )}
        </Card>
        
        <Title style={{...styles.sectionTitle, ...semiBoldTextStyle}}>O que você pode reportar</Title>
        
        <Card style={styles.alertCard}>
          <Card.Cover source={require('../../assets/images/Captura de tela 2025-04-18 194341.png')} />
          <Card.Content style={{paddingTop: 10}}>
            <Title style={{...styles.text, ...boldTextStyle}}>Árvore Caída</Title>
            <Text style={{...styles.text, ...textStyle}}>Reporte árvores caídas que estejam bloqueando vias ou causando perigo.</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.alertCard}>
          <Card.Cover source={require('../../assets/images/Captura de tela 2025-04-18 194652.png')} />
          <Card.Content style={{paddingTop: 10}}>
            <Title style={{...styles.text, ...boldTextStyle}}>Acidente</Title>
            <Text style={{...styles.text, ...textStyle}}>Ajude outras pessoas a evitar áreas com acidentes e congestionamentos.</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.alertCard}>
          <Card.Cover source={require('../../assets/images/Captura de tela 2025-04-18 194351.png')} />
          <Card.Content style={{paddingTop: 10}}>
            <Title style={{...styles.text, ...boldTextStyle}}>Poste sem Luz</Title>
            <Text style={{...styles.text, ...textStyle}}>Informe sobre postes ou regiões sem iluminação para agilizar o reparo.</Text>
          </Card.Content>
        </Card>          <Button 
          mode="contained" 
          style={styles.createButton}
          icon="bell-alert"
          onPress={() => router.push('/alertas')}
        >
          <Text style={{color: 'white'}}>Criar um Alerta</Text>
        </Button>

        <Card style={styles.mapCard}>
          <Card.Content>
            <Title style={{...styles.text, ...boldTextStyle}}>Mapa Interativo</Title>
            <Text style={{...styles.text, ...textStyle}}>
              Visualize todos os alertas criados na sua região através do nosso mapa interativo.
            </Text>
          </Card.Content>          <Card.Actions>
              <TouchableOpacity 
                style={{width: '100%'}}
                onPress={() => WebBrowser.openBrowserAsync('https://voz-ativa-front.vercel.app/')}
              >
                <Button 
                  mode="contained" 
                  style={styles.mapButton}
                  icon="map"
                  contentStyle={{width: '100%'}}
                >
                  <Text style={{color: 'white'}}>Acessar Mapa Interativo</Text>
                </Button>
              </TouchableOpacity>
          </Card.Actions>
        </Card>
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    position: 'absolute',
    bottom: -10,
    left: '35%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    fontFamily: 'Inter-Light',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    paddingVertical: 16,
    marginBottom: 24,
  },  sectionTitle: {
    marginVertical: 16,
    fontFamily: 'Inter-SemiBold',
  },
  alertCard: {
    marginBottom: 16,
  },
  createButton: {
    marginVertical: 20,
    paddingVertical: 8,
  },  text: {
    fontFamily: 'Inter',
  },
  mapCard: {
    marginBottom: 16,
  },
  mapButton: {
    backgroundColor: '#f57c00',
    paddingVertical: 8,
  }
});
