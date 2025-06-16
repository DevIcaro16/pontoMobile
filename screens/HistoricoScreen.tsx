import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { useAuth } from '../contexts/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/config/api';
import { formatInTimeZone } from 'date-fns-tz';
import { useUserDatabase } from '@/database/useUserDatabase';


interface Ponto {
  id: number;
  data: string;
  // descricao: string;
  latitude: number;
  longitude: number;
  status: string;
  // tipo: number;
}

const HistoricoScreen = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto
  const userID = user?.id || user?.response[0].id;
  console.log(userID);
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
  const [pontoId, setPontoId] = useState();
  const [dataPonto, setDataPonto] = useState();
  const [tipoPonto, setTipoPonto] = useState();
  const [latitudePonto, setLatitudePonto] = useState();
  const [longitudePonto, setLongitudePonto] = useState();
  const [loading, setLoading] = useState<boolean>(true);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const [items, setItems] = useState([
    { label: 'Atestado', value: 'atestado' },
    { label: 'Justificativa', value: 'justificativa' },
    { label: 'Sistema', value: 'sistema' },
    { label: 'Aplicativo mobile', value: 'app' },
    { label: 'Outro', value: 'outro' }
  ]);

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
      //   const response = await fetch('https://apispiceponto.sistemasgeo.com.br/pontos_usuario', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ userId: user?.userId })
      //   });
      console.log(response.data);
      if (!response) {
        // throw new Error('Erro ao buscar pontos do usuário');
        Alert.alert('Erro', 'Erro ao buscar pontos do usuário');
      }

      const pontos: Ponto[] = await response.data.pontos;

      if (!Array.isArray(pontos)) {
        throw new Error('Resposta do servidor não é um array');
      }

      const formattedPontos = pontos.map((ponto, index) => {
        const data = new Date(ponto.data);
        data.setHours(data.getHours() + 3); // Ajustando o fuso horário manualmente

        const dataFormatada = data.toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

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
          circleColor: ponto.status === "inconsistente" ? 'orange' : '#2196F3',
          lineColor: 'grey',
          timeStyle: {
            textAlign: 'center',
            backgroundColor: ponto.status === "inconsistente" ? 'orange' : '#2196F3',
            color: 'white',
            padding: 5,
            borderRadius: 13
          }
        };
      });


      setData(formattedPontos);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error instanceof Error ? 'Não foi possivel sincronizar o histórico' : 'Erro desconhecido');
    }
  };

  const handleActionPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
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
    const color = rowData.status === "inconsistente" ? 'orange' : 'rgb(45,156,219)';
    console.log(rowData.status)
    const title = <Text style={styles.title}>{rowData.title}</Text>;
    const desc = (
      <View style={styles.descriptionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={styles.textDescription}>{rowData.description}</Text>
          <TouchableOpacity onPress={() => handleActionPress(rowData)} style={{ marginLeft: 10 }}>
            <MaterialIcons name="info" size={24} color={color} />
          </TouchableOpacity>
        </View>

        {isConnected && rowData.status === "inconsistente" && (
          <TouchableOpacity style={[styles.btnRetificarPonto]} onPress={() => handleRetificar(rowData)}>
            <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 16 }}>Retificar</Text>
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

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });
      if (result.type === 'success') {
        setAnexo(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async () => {
    if (!titulo || !descricao || !subcategoria) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    try {
      if (isConnected) {
        const dataToSend = {
          data: dataPonto,
          tipo: tipoPonto,
          latitude: latitudePonto,
          longitude: longitudePonto,
          requisicao: {
            user_id: userID,
            titulo,
            descricao,
            subcategoria,
            anexo: anexo ?? null,
            data_inicio: dataInicio,
            data_termino: dataTermino
          }
        };

        const response = await api.post('/retificar', dataToSend);

        if (!response.data.success) {
          throw new Error('Erro ao enviar a solicitação de retificação');
        }

        Alert.alert('Sucesso', 'Solicitação de retificação enviada com sucesso.');
        setFormModalVisible(false);
        setTitulo('');
        setDescricao('');
        setSubcategoria('');
        setDataInicio(null);
        setDataTermino(null);
        setAnexo(null);
      } else {
        const useDatabase = await useUserDatabase();
        const response = await useDatabase.retificarPontoLocal(
          dataPonto ?? new Date(),
          tipoPonto ?? null,
          latitudePonto ?? '',
          longitudePonto ?? '',
          userID,
          pontoId ?? null,
          titulo,
          descricao,
          anexo,
          subcategoria,
          dataInicio ?? new Date(),
          dataTermino ?? new Date()
        );

        if (!response) {
          console.log('Não foi possivel gravar a retificação localmente')
        }

        Alert.alert('Retificação Gravada com Sucesso!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
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
            renderTime={(rowData) => (
              <Text
                style={{
                  textAlign: 'center',
                  backgroundColor: rowData.status === 'inconsistente' ? 'orange' : '#2196F3',
                  color: 'white',
                  marginTop: 8,
                  height: 32,
                  padding: 5,
                  borderRadius: 13,
                }}
              >
                {rowData.time}
              </Text>
            )}
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
              <Text>Descrição: {selectedItem.descricao}</Text>
              <Text>Data: {new Date(selectedItem.data).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</Text>

              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  minZoomLevel={17}
                  initialRegion={{
                    latitude: Number(selectedItem.latitudeAtual),
                    longitude: Number(selectedItem.longitudeAtual),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}>
                  <Marker
                    coordinate={{
                      latitude: Number(selectedItem.latitudeAtual),
                      longitude: Number(selectedItem.longitudeAtual),
                    }}
                    title={"Localização"}
                    description={selectedItem.descricao}
                  />
                </MapView>
              </View>
              <Text style={styles.status}>Status: {selectedItem.statusmsg}</Text>

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
              <TouchableOpacity onPress={handleFilePicker} style={styles.filePicker}>
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
              <TouchableOpacity onPress={handleFilePicker} style={styles.filePicker}>
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
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
});

export default HistoricoScreen;
