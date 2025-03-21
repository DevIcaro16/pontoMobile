import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Modal, TouchableOpacity, TextInput, Platform } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { useAuth } from '../contexts/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/config/api';


interface Ponto {
  id: number;
  dataehora: string;
  // descricao: string;
  latitude: number;
  longitude: number;
  // status: string;
  // tipo: number;
}

const HistoricoScreen = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto
  const userID = user?.userRequest.idfuncionario || 0;
  const [data, setData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataTermino, setDataTermino] = useState<Date | null>(null);
  const [anexo, setAnexo] = useState<any>(null);
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerTermino, setShowDatePickerTermino] = useState(false);

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

    fetchPontosUsuario();

    return () => unsubscribe();
  }, []);

  const fetchPontosUsuario = async () => {
    if (!isConnected) return;

    try {
      const response = await api.post("/pontosdousuario", {
        userID: "00002"
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

      const formattedPontos = pontos.map((ponto, index) => ({
        id: ponto.id,
        time: new Date(ponto.dataehora).toLocaleDateString('pt-BR'),
        // title: ponto.descricao,
        // description: `Batido em: ${new Date(ponto.dataehora).toLocaleString('pt-BR')}\nConsta como: ${ponto.status}`,
        description: `Batido em: ${new Date(ponto.dataehora).toLocaleString('pt-BR')}\n`,
        data: ponto.dataehora,
        // descricao: ponto.descricao,
        latitudeAtual: ponto.latitude,
        longitudeAtual: ponto.longitude,
        // status: ponto.status,
        // circleColor: ponto.tipo % 2 === 0 ? 'orange' : '#2196F3',
        circleColor: '#2196F3',
        lineColor: 'grey'
      }));

      setData(formattedPontos);


    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleActionPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderDetail = (rowData: any) => {
    const title = <Text style={styles.title}>{rowData.title}</Text>;
    const desc = (
      <View style={styles.descriptionContainer}>
        <Text style={styles.textDescription}>{rowData.description}</Text>
        <Button title="Info" onPress={() => handleActionPress(rowData)} />
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
      // if (result.type === 'success') {
      //   setAnexo(result);
      // }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async () => {
    if (!titulo || !descricao || !subcategoria || !dataInicio || !dataTermino) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', user.userId);
    formData.append('title', titulo);
    formData.append('descript', descricao);
    formData.append('subcategoria', subcategoria);
    formData.append('data_inicio', dataInicio.toISOString());
    formData.append('data_termino', dataTermino.toISOString());

    if (anexo) {
      formData.append('anexo', {
        uri: anexo.uri,
        name: anexo.name,
        type: anexo.mimeType,
      } as any);
    }

    // try {
    //   const response = await fetch('https://apispiceponto.sistemasgeo.com.br/retificar', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error('Erro ao enviar a solicitação de retificação');
    //   }

    //   Alert.alert('Sucesso', 'Solicitação de retificação enviada com sucesso.');
    //   setFormModalVisible(false);
    //   setTitulo('');
    //   setDescricao('');
    //   setSubcategoria('');
    //   setDataInicio(null);
    //   setDataTermino(null);
    //   setAnexo(null);
    // } catch (error) {
    //   console.error(error);
    //   Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    // }
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

  return (
    <View style={styles.container}>
      {isConnected && (
        <Button title="Retificar" onPress={() => setFormModalVisible(true)} style={styles.retificarButton} />
      )}
      <Timeline
        data={data}
        circleSize={20}
        circleColor='rgb(45,156,219)'
        circleStyle={{ marginTop: 10 }}
        lineColor='rgb(45,156,219)'
        timeContainerStyle={{ minWidth: 52, marginTop: 5 }}
        timeStyle={{
          textAlign: 'center',
          backgroundColor: '#2196F3',
          color: 'white',
          padding: 5,
          borderRadius: 13
        }}
        descriptionStyle={{ color: 'gray' }}

        renderDetail={renderDetail}
        style={{ paddingTop: 5 }}
      //columnFormat='single-column-right'
      />

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
              <Text style={styles.status}>Status: {selectedItem.status}</Text>

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
                onPress={() => setFormModalVisible(!formModalVisible)}>
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
});

export default HistoricoScreen;
