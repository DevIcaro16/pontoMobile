import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity, TextInput, Platform, ActivityIndicator, Linking } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { useAuth } from '../contexts/AuthContext';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/config/api';
import { formatInTimeZone } from 'date-fns-tz';
import { useUserDatabase } from '@/database/useUserDatabase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';


interface Ponto {
  id: number;
  data: string;
  // descricao: string;
  latitude: number;
  longitude: number;
  status: string;
  statusmsg: string;
  tipo: number;
  retflg: string;
}

const HistoricoScreen = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto
  const userID = user?.id ?? user?.response[0].id;
  console.log(userID);
  // alert(userID);
  // const userID = user?.userRequest.idfuncionario || 0;
  const [data, setData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formJustificativaModalVisible, setFormJustificativaModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [anexo, setAnexo] = useState<any>(null);
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerTermino, setShowDatePickerTermino] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [pontoId, setPontoId] = useState<number | undefined>();
  const [dataPonto, setDataPonto] = useState<string | undefined>();
  const [tipoPonto, setTipoPonto] = useState<number | undefined>();
  const [latitudePonto, setLatitudePonto] = useState<number | undefined>();
  const [longitudePonto, setLongitudePonto] = useState<number | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const [items, setItems] = useState([
    { label: 'Atestado', value: 'atestado' },
    // { label: 'Justificativa', value: 'justificativa' },
    { label: 'Transporte', value: 'transporte' },
    // { label: 'Sistema', value: 'sistema' },
    { label: 'Aplicativo mobile', value: 'app' },
    { label: 'Outro', value: 'outro' }
  ]);

  // Componente de mapa seguro com fallback
  const SafeMapView = ({ latitude, longitude, title, description }: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
  }) => {
    const [showNativeMap, setShowNativeMap] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Função para abrir no Google Maps
    const openInGoogleMaps = () => {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url).catch(err => {
        console.error('Erro ao abrir Google Maps:', err);
        Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
      });
    };

    // Por padrão, mostrar o fallback (mais estável)
    if (!showNativeMap) {
      return (
        <View style={styles.mapContainer}>
          <Text style={styles.locationTitle}>Localização do Ponto</Text>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>
              Latitude: {latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesText}>
              Longitude: {longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.googleMapsButton}
            onPress={openInGoogleMaps}
          >
            <Text style={styles.googleMapsButtonText}>Abrir no Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowNativeMap(true)}
          >
            <Text style={styles.retryButtonText}>Tentar mapa nativo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Tentar carregar o mapa nativo
    try {
      return (
        <View style={styles.mapContainer}>
          {!mapLoaded && (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.mapLoadingText}>Carregando mapa...</Text>
              <Text style={styles.mapLoadingSubtext}>Pode demorar alguns segundos</Text>
            </View>
          )}
          <MapView
            style={[styles.map, !mapLoaded && styles.mapHidden]}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            minZoomLevel={15}
            maxZoomLevel={20}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
            loadingEnabled={true}
            loadingIndicatorColor="#007AFF"
            loadingBackgroundColor="#ffffff"
            onMapReady={() => {
              console.log('Mapa carregado com sucesso');
              setMapLoaded(true);
            }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            <Marker
              coordinate={{
                latitude,
                longitude,
              }}
              title={title}
              description={description}
              pinColor="#007AFF"
            />
          </MapView>
          <View style={styles.mapButtonsContainer}>
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={() => setShowNativeMap(false)}
            >
              <Text style={styles.fallbackButtonText}>Voltar para coordenadas</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Erro ao renderizar mapa:', error);
      return (
        <View style={styles.mapContainer}>
          <Text style={styles.noLocationText}>Erro ao carregar mapa nativo</Text>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>
              Latitude: {latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesText}>
              Longitude: {longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.googleMapsButton}
            onPress={openInGoogleMaps}
          >
            <Text style={styles.googleMapsButtonText}>Abrir no Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowNativeMap(false)}
          >
            <Text style={styles.retryButtonText}>Voltar para coordenadas</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    setTimeout(() => {
      fetchPontosUsuario();
      setLoading(false);
    }, 2000);

    return () => unsubscribe();
  }, []);

  const fetchPontosUsuario = async () => {
    if (!isConnected) return;

    try {
      const response = await api.post("/pontosdousuario", {
        userID: userID
      });

      console.log(response.data);

      if (!response) {
        Alert.alert('Erro', 'Erro ao buscar pontos do usuário');
        return;
      }

      const pontos: Ponto[] = response.data.pontos;

      if (!Array.isArray(pontos)) {
        throw new Error('Resposta do servidor não é um array');
      }

      const formattedPontos = pontos.map((ponto, index) => {
        const data = new Date(ponto.data);
        data.setHours(data.getHours() + 3); // Ajuste de fuso horário manual

        const dataFormatada = data.toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const isRetificado = ponto.retflg === '1';
        const baseColor = isRetificado ? 'green' : (ponto.status === "inconsistente" ? 'orange' : '#2196F3');

        return {
          id: ponto.id,
          time: data.toLocaleDateString('pt-BR'),
          description: `Batido em: ${dataFormatada}\n`,
          data: ponto.data,
          tipo: ponto.tipo,
          latitudeAtual: ponto.latitude,
          longitudeAtual: ponto.longitude,
          status: ponto.status,
          statusmsg: ponto.statusmsg,
          retflg: ponto.retflg,
          retificado: isRetificado ? 'Retificado' : '',
          circleColor: baseColor,
          lineColor: 'grey',
          timeStyle: {
            textAlign: 'center',
            backgroundColor: baseColor,
            color: 'white',
            padding: 5,
            borderRadius: 13
          }
        };
      });

      setData(formattedPontos);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error instanceof Error ? 'Não foi possível sincronizar o histórico' : 'Erro desconhecido');
    }
  };


  const handleActionPress = (item: any) => {
    try {
      if (!item) {
        console.error('Item não encontrado');
        return;
      }

      // Validação básica dos dados necessários
      if (!item.data || !item.latitudeAtual || !item.longitudeAtual) {
        console.warn('Dados do ponto incompletos:', item);
      }

      // Resetar estados do mapa
      setMapLoaded(false);
      setMapError(false);

      setSelectedItem(item);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao abrir modal de detalhes:', error);
    }
  };

  const handleRetificar = (data: any) => {
    console.log(data);
    setPontoId(data.id);
    setDataPonto(data.data);
    setTipoPonto(data.tipo);
    setLatitudePonto(data.latitudeAtual);
    setLongitudePonto(data.longitudeAtual);
    setFormModalVisible(true);
  };

  const renderDetail = (rowData: any) => {
    const isRetificado = rowData.retflg === '1';
    const isInconsistente = rowData.status === "inconsistente";

    const color = isRetificado ? 'green' : (isInconsistente ? 'orange' : 'rgb(45,156,219)');

    const title = <Text style={styles.title}>{rowData.title}</Text>;

    const desc = (
      <View style={styles.descriptionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.textDescription}>
            {rowData.description}
            {isRetificado ? '\n[Retificado]' : ''}
          </Text>
          <TouchableOpacity onPress={() => handleActionPress(rowData)} style={{ marginLeft: 10 }}>
            <MaterialIcons name="info" size={24} color={color} />
          </TouchableOpacity>
        </View>

        {isConnected && isInconsistente && !isRetificado && (
          <TouchableOpacity
            style={styles.btnRetificarPonto}
            onPress={() => handleRetificar(rowData)}
          >
            <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 16 }}>
              Retificar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <View style={styles.detailContainer}>
        {title}
        {desc}
      </View>
    );
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = result.assets[0].base64;
        if (base64Image) {
          // Reduzir ainda mais o tamanho da imagem
          const compressedImage = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 600, height: 600 } }],
            { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          if (compressedImage.base64) {
            // Verificar o tamanho da string base64
            const base64Size = compressedImage.base64.length;
            console.log('Tamanho da string base64:', base64Size, 'bytes');

            // Se ainda estiver muito grande, reduzir mais
            if (base64Size > 500000) { // 500KB
              const furtherCompressed = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 400, height: 400 } }],
                { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG, base64: true }
              );
              setAnexo(furtherCompressed.base64);
            } else {
              setAnexo(compressedImage.base64);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleFormSubmit = async () => {
    if (!titulo || !descricao || !subcategoria) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    try {
      if (isConnected) {
        // Garantir que a data está em um formato válido
        const dataPontoFormatada = dataPonto ? new Date(dataPonto).toISOString() : null;

        const dataToSend = {
          data: dataPontoFormatada,
          tipo: tipoPonto ? parseInt(String(tipoPonto)) : null,
          latitude: latitudePonto ? String(latitudePonto) : '',
          longitude: longitudePonto ? String(longitudePonto) : '',
          requisicao: {
            user_id: parseInt(String(userID)),
            titulo,
            descricao,
            subcategoria,
            anexo: anexo || null,
            data_inicio: dataInicio ? dataInicio.toISOString() : null,
            data_termino: dataTermino ? dataTermino.toISOString() : null
          }
        };

        setLoading(true);
        console.log('Enviando dados:', JSON.stringify(dataToSend, null, 2));

        const response = await api.post('/retificar', dataToSend);

        if (!response.data.success) {
          throw new Error('Erro ao enviar a solicitação de retificação');
        }

        Alert.alert('Sucesso', 'Solicitação de retificação enviada com sucesso.');
        setFormModalVisible(false);
        setFormJustificativaModalVisible(false);
        setTitulo('');
        setDescricao('');
        setSubcategoria('');
        setDataInicio(null);
        setDataTermino(null);
        setAnexo(null);
        fetchPontosUsuario();
        setLoading(false);
      } else {
        try {
          const useDatabase = await useUserDatabase();
          if (!useDatabase) {
            throw new Error('Não foi possível acessar o banco de dados local');
          }

          // Garantir que as datas estão em um formato válido para o banco local
          const dataPontoLocal = dataPonto ? new Date(dataPonto) : new Date();
          const dataInicioLocal = dataInicio || new Date();
          const dataTerminoLocal = dataTermino || new Date();

          const response = await useDatabase.retificarPontoLocal(
            dataPontoLocal,
            tipoPonto ? parseInt(String(tipoPonto)) : null,
            latitudePonto ? String(latitudePonto) : '',
            longitudePonto ? String(longitudePonto) : '',
            String(userID),
            pontoId ?? null,
            titulo,
            descricao,
            anexo || null,
            subcategoria,
            dataInicioLocal,
            dataTerminoLocal
          ).catch(error => {
            console.error('Erro ao salvar retificação:', error);
            throw new Error('Falha ao salvar no banco de dados local');
          });

          if (!response) {
            throw new Error('Não foi possível gravar a retificação localmente');
          }

          Alert.alert('Sucesso', 'Retificação Gravada com Sucesso!');
          setFormModalVisible(false);
          setTitulo('');
          setDescricao('');
          setSubcategoria('');
          setDataInicio(null);
          setDataTermino(null);
          setAnexo(null);
        } catch (dbError) {
          console.error('Erro no banco de dados local:', dbError);
          Alert.alert(
            'Erro',
            'Não foi possível salvar a retificação localmente. Por favor, tente novamente quando estiver online.'
          );
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro desconhecido ao processar a retificação'
      );
    } finally {
      setLoading(false);
    }
  };


  const handleDateChangeInicio = (event: any, selectedDate: Date | undefined) => {
    setShowDatePickerInicio(Platform.OS === 'ios');
    if (selectedDate) {
      setDataInicio(selectedDate);
    }
  };

  const handleDateChangeTermino = (event: any, selectedDate: Date | undefined) => {
    setShowDatePickerTermino(Platform.OS === 'ios');
    if (selectedDate) {
      setDataTermino(selectedDate);
    }
  };

  if (!isConnected) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.offlineText}>Conecte-se a internet para exibir seu histórico.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <Modal visible={true} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando Histórico de Batidas...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>

      {isConnected && (
        <TouchableOpacity style={styles.btnJustificar} onPress={() => setFormJustificativaModalVisible(true)}>
          <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 16 }}>Emitir Justificativa</Text>
        </TouchableOpacity>
      )}
      {
        data.length > 0 && !loading ? (
          <Timeline
            data={data}
            circleSize={20}
            circleStyle={{ marginTop: 10 }}
            lineColor="rgb(45,156,219)"
            timeContainerStyle={{ minWidth: 52, marginTop: 5 }}
            descriptionStyle={{ color: 'gray' }}
            renderDetail={renderDetail}
            renderTime={(rowData) => {
              const isRetificado = rowData.retflg === '1';
              const isInconsistente = rowData.status === 'inconsistente';

              const backgroundColor = isRetificado
                ? 'green'
                : (isInconsistente ? 'orange' : '#2196F3');

              return (
                <Text
                  style={{
                    textAlign: 'center',
                    backgroundColor: backgroundColor,
                    color: 'white',
                    marginTop: 8,
                    height: 32,
                    padding: 5,
                    borderRadius: 13,
                  }}
                >
                  {rowData.time}
                </Text>
              );
            }}
            style={{ paddingTop: 5 }}
          />


        ) : (
          <View style={styles.centeredView}>
            <Text style={styles.offlineText}>Não foi possivel resgatar suas Batidas</Text>
          </View>
        )
      }


      {selectedItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setSelectedItem(null);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Detalhes do Ponto</Text>
              <Text>Descrição: {selectedItem.descricao || 'Sem Descrição'}</Text>
              <Text>Data: {(() => {
                try {
                  if (!selectedItem.data) return 'Data não disponível';
                  const data = new Date(selectedItem.data);
                  if (isNaN(data.getTime())) return 'Data inválida';
                  data.setHours(data.getHours() + 3); // Ajuste de fuso horário manual
                  return data.toLocaleString('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                } catch (error) {
                  console.error('Erro ao formatar data:', error);
                  return 'Erro ao formatar data';
                }
              })()}</Text>

              {(() => {
                try {
                  const lat = Number(selectedItem.latitudeAtual);
                  const lng = Number(selectedItem.longitudeAtual);

                  // Verificação mais rigorosa das coordenadas
                  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0 ||
                    lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    return (
                      <View style={styles.mapContainer}>
                        <Text style={styles.noLocationText}>Localização não disponível</Text>
                      </View>
                    );
                  }

                  return (
                    <SafeMapView
                      latitude={lat}
                      longitude={lng}
                      title="Localização do Ponto"
                      description={selectedItem.descricao || "Ponto registrado"}
                    />
                  );
                } catch (error) {
                  console.error('Erro ao renderizar mapa:', error);
                  return (
                    <View style={styles.mapContainer}>
                      <Text style={styles.noLocationText}>Erro ao carregar mapa</Text>
                    </View>
                  );
                }
              })()}

              <View style={styles.modalBottomContainer}>
                <Text style={styles.status}>Status: {selectedItem.statusmsg || 'N/A'}</Text>

                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setSelectedItem(null);
                  }}>
                  <Text style={styles.textStyle}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {formModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={formModalVisible}
          onRequestClose={() => {
            setFormModalVisible(!formModalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Solicitar Retificação</Text>
              <TextInput
                style={styles.input}
                placeholder="Título"
                value={titulo}
                onChangeText={setTitulo}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
              />

              {/* <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setShowDatePickerInicio(true)} style={styles.datePicker}>
                  <Text>{dataInicio ? dataInicio.toLocaleDateString('pt-BR') : 'Data de Início'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePickerTermino(true)} style={styles.datePicker}>
                  <Text>{dataTermino ? dataTermino.toLocaleDateString('pt-BR') : 'Data de Término'}</Text>
                </TouchableOpacity>
              </View> */}
              {showDatePickerInicio && (
                <DateTimePicker
                  value={dataInicio || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeInicio}
                />
              )}
              {showDatePickerTermino && (
                <DateTimePicker
                  value={dataTermino || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeTermino}
                />
              )}
              <TouchableOpacity onPress={handleImagePick} style={styles.filePicker}>
                <Text>Selecionar Anexo</Text>
              </TouchableOpacity>
              {anexo && (
                <View style={styles.anexoContainer}>
                  <MaterialIcons name="attachment" size={24} color="black" />
                  <Text style={styles.anexoText}>{anexo.name}</Text>
                </View>
              )}
              <DropDownPicker
                open={open}
                value={subcategoria}
                items={items}
                setOpen={setOpen}
                setValue={setSubcategoria}
                setItems={setItems}
                placeholder="Selecione a Subcategoria"
                containerStyle={{ height: 40, marginBottom: 10 }}
              />

              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={handleFormSubmit}>
                <Text style={styles.textStyle}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setFormModalVisible(!formModalVisible)}>
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}



      {formJustificativaModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={formJustificativaModalVisible}
          onRequestClose={() => {
            setFormJustificativaModalVisible(!formJustificativaModalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Emitir Justificativa</Text>
              <TextInput
                style={styles.input}
                placeholder="Título"
                value={titulo}
                onChangeText={setTitulo}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
              />

              <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setShowDatePickerInicio(true)} style={styles.datePicker}>
                  <Text>{dataInicio ? dataInicio.toLocaleDateString('pt-BR') : 'Data de Início'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePickerTermino(true)} style={styles.datePicker}>
                  <Text>{dataTermino ? dataTermino.toLocaleDateString('pt-BR') : 'Data de Término'}</Text>
                </TouchableOpacity>
              </View>
              {showDatePickerInicio && (
                <DateTimePicker
                  value={dataInicio || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeInicio}
                />
              )}
              {showDatePickerTermino && (
                <DateTimePicker
                  value={dataTermino || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeTermino}
                />
              )}
              <TouchableOpacity onPress={handleImagePick} style={styles.filePicker}>
                <Text>Selecionar Anexo</Text>
              </TouchableOpacity>
              {anexo && (
                <View style={styles.anexoContainer}>
                  <MaterialIcons name="attachment" size={24} color="black" />
                  <Text style={styles.anexoText}>{anexo.name}</Text>
                </View>
              )}
              <DropDownPicker
                open={open}
                value={subcategoria}
                items={items}
                setOpen={setOpen}
                setValue={setSubcategoria}
                setItems={setItems}
                placeholder="Selecione a Subcategoria"
                containerStyle={{ height: 40, marginBottom: 10 }}
              />

              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={handleFormSubmit}>
                <Text style={styles.textStyle}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setFormJustificativaModalVisible(!formJustificativaModalVisible)}>
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  retificarButton: {
    marginTop: 20,
    marginBottom: 200,
    alignSelf: 'center'
  },
  sincronizarButton: {
    marginBottom: 20,
    alignSelf: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 10,
    paddingRight: 50
  },
  textDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: 'gray'
  },
  detailContainer: {
    flex: 1
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  datePicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  filePicker: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  anexoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  anexoText: {
    marginLeft: 5,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    margin: 10,
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginTop: 20,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    flex: 1,
    textAlign: 'left',
  },
  offlineText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
  },
  btnInfoPonto: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    height: 28,
    width: '50%',
    alignSelf: 'flex-end',
  },
  btnRetificarPonto: {
    // backgroundColor: '#2196F3',
    backgroundColor: 'orange',
    marginTop: 8,
    borderRadius: 8,
    height: 28,
    width: '40%',
    alignSelf: 'flex-end',
  },
  btnJustificar: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    height: 36,
    width: '100%',
    alignSelf: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  noLocationText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  mapLoadingSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  mapHidden: {
    opacity: 0,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coordinatesContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginVertical: 2,
  },
  googleMapsButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  googleMapsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fallbackButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  fallbackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  modalBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 54,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default HistoricoScreen;
