import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Text, Button, Title, Surface, TextInput, SegmentedButtons, 
  Card, IconButton, Snackbar, Dialog, Portal, List
} from 'react-native-paper';
import { RootState, AppDispatch } from '../redux/store';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { fetchAlerts, createAlert, deleteAlert, Alert as AlertType } from '../redux/alertSlice';
import { StatusBar } from 'expo-status-bar';

// Text styles with various font weights
const textStyle = { fontFamily: 'Inter' };
const boldTextStyle = { fontFamily: 'Inter-Bold' };
const mediumTextStyle = { fontFamily: 'Inter-Medium' };
const lightTextStyle = { fontFamily: 'Inter-Light' };
const semiBoldTextStyle = { fontFamily: 'Inter-SemiBold' };

export default function AlertScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);  const { alerts, status, error } = useSelector((state: RootState) => state.alert);
  const [category, setCategory] = useState('arvore_caida');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number; address?: string} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Verifica permissão e obtém alertas ao carregar
  useEffect(() => {
    if (token) {
      dispatch(fetchAlerts());
    }
  }, [token, dispatch]);
  
  // Função para atualizar a lista de alertas (pull-to-refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (token) {
      await dispatch(fetchAlerts());
    }
    setRefreshing(false);
  }, [token, dispatch]);

  // Manipuladores para captura de imagem
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setSnackbarMessage('Precisamos de permissão para acessar sua galeria');
      setSnackbarVisible(true);
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    } else if (result.canceled) {
      // Handle canceled selection
      console.log('Seleção de imagem cancelada');
    }
  };
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      setSnackbarMessage('Precisamos de permissão para acessar sua câmera');
      setSnackbarVisible(true);
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    } else if (result.canceled) {
      // Handle canceled photo capture
      console.log('Captura de foto cancelada');
    }
  };  // Manipulador para obter localização atual
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setSnackbarMessage('Precisamos de permissão para acessar sua localização');
        setSnackbarVisible(true);
        setLocationLoading(false);
        return;
      }
      
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Obter endereço usando geocoding reverso
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude
      });
      
      const address = addressResponse[0] ? {
        street: addressResponse[0].street,
        district: addressResponse[0].district,
        city: addressResponse[0].city,
        region: addressResponse[0].region,
        postalCode: addressResponse[0].postalCode,
        country: addressResponse[0].country
      } : undefined;
      
      setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        address: address ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim() : undefined
      });
      
      setSnackbarMessage('Localização obtida com sucesso!');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Erro ao obter localização');
      setSnackbarVisible(true);
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Manipulador para submeter o alerta
  const handleSubmit = async () => {    if (!description) {
      setSnackbarMessage('Por favor, preencha a descrição');
      setSnackbarVisible(true);
      return;
    }
    
    const alertData = {
      category,
      description,
      photo: photo || undefined, // Convert null to undefined to match CreateAlertData type
      location: location || undefined,
    };
    
    try {
      const resultAction = await dispatch(createAlert(alertData));
      
      if (createAlert.fulfilled.match(resultAction)) {
        setSnackbarMessage('Alerta criado com sucesso!');
        setSnackbarVisible(true);
        resetForm();
      } else {
        setSnackbarMessage('Erro ao criar alerta: ' + (error || 'Falha desconhecida'));
        setSnackbarVisible(true);
      }
    } catch (err) {
      setSnackbarMessage('Erro ao criar alerta');
      setSnackbarVisible(true);
    }
  };
  
  // Reset do formulário
  const resetForm = () => {
    setCategory('arvore_caida');
    setDescription('');
    setPhoto(null);
    setLocation(null);
    setShowForm(false);
  };
  
  // Manipulador para deletar alerta
  const handleDeleteAlert = async () => {
    if (selectedAlertId) {
      try {
        const resultAction = await dispatch(deleteAlert(selectedAlertId));
        
        if (deleteAlert.fulfilled.match(resultAction)) {
          setSnackbarMessage('Alerta removido com sucesso!');
          setSnackbarVisible(true);
        } else {
          setSnackbarMessage('Erro ao remover alerta: ' + (error || 'Falha desconhecida'));
          setSnackbarVisible(true);
        }
      } catch (err) {
        setSnackbarMessage('Erro ao remover alerta');
        setSnackbarVisible(true);
      } finally {
        setDeleteDialogVisible(false);
        setSelectedAlertId(null);
      }
    }
  };
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Tradução das categorias para português
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'arvore_caida': return 'Árvore Caída';
      case 'acidente': return 'Acidente';
      case 'poste_sem_luz': return 'Poste sem Luz';
      default: return category;
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Surface style={styles.header} elevation={2}>
          <Title style={styles.title}>Alertas</Title>
        </Surface>
        
        <View style={styles.centeredContent}>
          <Text style={{...styles.emptyText, ...textStyle}}>Faça login para criar e visualizar alertas</Text>          <Button 
            mode="contained" 
            onPress={() => router.push('/profile')}
            style={styles.loginButton}
          >
            <Text style={{color: 'white'}}>Fazer Login</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerLeftContent}>
          <Image 
            source={require('../../assets/images/VOZ-removebg-preview.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Title style={{...styles.title, ...boldTextStyle}}>Alertas</Title>
        </View>        {!showForm ? (
          <Button 
            mode="contained" 
            icon="plus" 
            onPress={() => setShowForm(true)}
            style={styles.createButton}
          >
            <Text>Criar Alerta</Text>
          </Button>
        ) : (
          <Button 
            mode="text" 
            icon="arrow-left" 
            textColor="white"
            onPress={() => setShowForm(false)}
          >
            <Text>Voltar</Text>
          </Button>
        )}
      </Surface>

      {showForm ? (
        <ScrollView style={styles.content}>
          <Card style={styles.formCard}>          <Card.Content>
              <Title style={mediumTextStyle}>Novo Alerta</Title>
              
              <Text style={{...styles.label, ...textStyle}}>Categoria do Alerta</Text>
              <SegmentedButtons
                value={category}
                onValueChange={setCategory}
                buttons={[
                  { value: 'arvore_caida', label: 'Árvore' },
                  { value: 'acidente', label: 'Acidente' },
                  { value: 'poste_sem_luz', label: 'Poste' }
                ]}
                style={styles.segmentButtons}
              />
              
              <TextInput
                label="Descrição"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.input}
              />
                <View style={styles.imagePickerContainer}>
                <Button 
                  mode="outlined" 
                  icon="camera" 
                  onPress={takePhoto}
                  style={styles.imageButton}
                >
                  <Text>Câmera</Text>
                </Button>
                <Button 
                  mode="outlined" 
                  icon="image" 
                  onPress={pickImage}
                  style={styles.imageButton}
                >
                  <Text>Galeria</Text>
                </Button>
              </View>
              
              {photo && (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <IconButton
                    icon="close-circle"
                    size={24}
                    style={styles.removePhotoButton}
                    onPress={() => setPhoto(null)}
                  />
                </View>
              )}
                <Button 
                mode="outlined" 
                icon="map-marker" 
                onPress={getCurrentLocation}
                loading={locationLoading}
                style={styles.locationButton}
              >
                <Text>{location ? 'Localização Adicionada' : 'Adicionar Localização'}</Text>
              </Button>
              
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                loading={status === 'loading'}
                style={styles.submitButton}
                disabled={status === 'loading' || !description}
              >
                <Text>Enviar Alerta</Text>
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#006400']} 
            />
          }
        >
          <Title style={{...styles.sectionTitle, ...semiBoldTextStyle}}>Meus Alertas</Title>
          
          {status === 'loading' && !refreshing && (
            <ActivityIndicator animating={true} size="large" style={styles.loader} />
          )}
            {alerts.length === 0 && status !== 'loading' && (
            <Text style={{...styles.emptyText, ...lightTextStyle}}>
              Você ainda não criou nenhum alerta
            </Text>
          )}
          
          {alerts.map((alert: AlertType) => (
            <Card key={alert.id} style={styles.alertCard}>
              <Card.Title 
                title={getCategoryLabel(alert.category)} 
                right={(props) => (
                  <IconButton 
                    {...props} 
                    icon="delete" 
                    onPress={() => {
                      setSelectedAlertId(alert.id);
                      setDeleteDialogVisible(true);
                    }} 
                  />
                )}
              />
              <Card.Content>
                <Text style={{...styles.alertDescription, ...textStyle}}>{alert.description}</Text>
                <Text style={{...styles.alertDate, ...lightTextStyle}}>
                  Criado em: {formatDate(alert.createdAt)}
                </Text>
                
                {alert.location && (
                  <Text style={{...styles.alertLocation, ...lightTextStyle}}>
                    Localização incluída
                  </Text>
                )}
              </Card.Content>
              {alert.photo && (
                <Card.Cover source={{ uri: alert.photo }} style={styles.alertImage} />
              )}
            </Card>
          ))}
        </ScrollView>
      )}
      
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar exclusão</Dialog.Title>
          <Dialog.Content>
            <Text>Tem certeza que deseja excluir este alerta?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              <Text>Cancelar</Text>
            </Button>
            <Button onPress={handleDeleteAlert}>
              <Text>Excluir</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formCard: {
    marginBottom: 16,
  },  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  segmentButtons: {
    marginBottom: 16,
  },  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    fontFamily: 'Inter',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  photoPreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  photoPreview: {
    height: 200,
    width: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  locationButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },  sectionTitle: {
    marginVertical: 16,
    fontFamily: 'Inter-SemiBold',
  },
  alertCard: {
    marginBottom: 16,
  },  alertDescription: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  alertDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
    fontFamily: 'Inter-Light',
  },
  alertLocation: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
    fontFamily: 'Inter-Light',
  },
  alertImage: {
    height: 150,
    marginTop: 8,
  },  emptyText: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Inter',
  },
  loginButton: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  createButton: {
    backgroundColor: '#004d00',
  },
});
