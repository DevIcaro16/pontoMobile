import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho conforme necessário
import * as LocalAuthentication from 'expo-local-authentication'; //Leitor de digital, etc

import { addMinutes, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale'; // Importa o locale do Português do Brasil
import { useUserDatabase } from '@/database/useUserDatabase';
import api from '@/config/api';

interface PontoPayload {
  userId: number;
  username: string;
  empresa: string;
  tipo: string;
  data: Date;
  diaDaSemana: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
  distancia: number | null;
  descricao: string | null;
  cliente_id: number | null;
  cliente_des: string | null;
  status: string;
  adm_id: number | null;
  resposta: string | null;
  escala: string | null;
  modeloBatida: string | null;
  statusmsg: string;
  foto_path: string;
  status_cod: number | null;
}


const PontoScreen = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto
  console.log(user);
  // const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [location, setLocation] = useState<null | { latitude: number; longitude: number }>(null);


  // const [ultimoPontoReg, setUltimoPontoReg] = useState<{ hora: string; tipo: string; tipoDesc: string } | null>(null);
  const [mensagemRetorno, setMensagemRetorno] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [ultimoPontoReg, setUltimoPontoReg] = useState<boolean>(false);
  // const [ultimoPontoHor, setUltimoPontoHor] = useState<string>("");
  const [ultimoPontoHor, setUltimoPontoHor] = useState<string[] | null>([]);

  const [tipo, setTipo] = useState<number>(0);

  function formatDate(date: Date) {
    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  function getDayOfWeek(date: Date) {
    const fullDay = format(date, "EEEE", { locale: ptBR }); // Retorna "quinta-feira"
    return fullDay.split("-")[0]; // Retorna "quinta"
  }
  // Uso da função
  const currentDate = formatDate(new Date());

  const userDatabase = useUserDatabase();


  const buscarPontosUsuario = async () => {
    const response = await userDatabase.buscarPontosUsuario(userIDFormat);
    return response;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Você precisa permitir o acesso à localização.");
        return;
      }


      let location = await Location.getCurrentPositionAsync({});
      if (location.coords.latitude !== undefined && location.coords.longitude !== undefined) {
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }

      console.log(location.coords.latitude);
      console.log(location.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    const carregarPontos = async () => {
      try {
        const pontosDoDia = await buscarPontosUsuario();

        if (pontosDoDia) {
          setUltimoPontoReg(true);
          setUltimoPontoHor(pontosDoDia.filter(ponto => ponto != undefined));
          setTipo(pontosDoDia.length);
          console.log('setUltimoPontoHor' + pontosDoDia + "-" + pontosDoDia.length);
        }
      } catch (error) {
        console.error("Erro ao buscar pontos diários do usuário:", error);
      }
    };

    carregarPontos();
  }, [user]);  // Recarrega os pontos sempre que o usuário mudar



  // const empresa = user?.empresa || null;
  const empresa = user?.response[0].empresa ?? '';
  const username = user?.response[0].username ?? '';
  const escala = user?.response[0].escala ?? '';
  const modeloBatida = user?.response[0].modeloBatida ?? '';
  const userID = user?.response[0].id ?? '';

  function padNumber(num: number) {
    return num.toString().padStart(5, '0');
  }

  const userIDFormat = padNumber(userID);

  async function baterPonto(dataFormatada: string, tipo: number) {

    // console.log(dataFormatada);
    if (!location) {
      Alert.alert("Erro", "Localização não disponível");
      return;
    }
    const latitudeStr = location.latitude.toString();
    const longitudeStr = location.longitude.toString();
    const response = await userDatabase.baterPonto(
      userIDFormat,
      username,
      empresa,
      tipo,
      dataFormatada,
      getDayOfWeek(new Date()),
      latitudeStr,
      longitudeStr,
      new Date(),
      new Date()
    );

    if (response) {
      Alert.alert(
        "Aviso",
        response,
        [
          {
            text: "Voltar",
            onPress: () => console.log("Sincronização cancelada"),
            style: "cancel"
          },
          {
            text: "Sincronizar",
            onPress: () => sincronizarPonto()
          }
        ],
        { cancelable: true }
      );
    } else {
      return null;
    }


  }

  const handleBaterPonto = async () => {
    if (isButtonDisabled) {
      // Se o botão está desabilitado, não faça nada
      return;
    }
    setIsButtonDisabled(true);

    // Reabilita o botão após 5 segundos
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 5000);

    // Verifica os tipos de autenticação disponíveis
    const supportedMethods = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Verifica se há suporte para reconhecimento facial, digital e íris
    const hasFacialRecognition = supportedMethods.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const hasFingerprint = supportedMethods.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
    const hasIrisRecognition = supportedMethods.includes(LocalAuthentication.AuthenticationType.IRIS); // Exemplo de verificação de íris

    const promptConfig = {
      promptMessage: "Autentique para registrar o ponto",
      cancelLabel: "Cancelar",
      fallbackLabel: "Usar senha",
      disableDeviceFallback: true,
    };

    // Tenta autenticação facial, se disponível
    if (hasFacialRecognition) {
      const result = await LocalAuthentication.authenticateAsync({
        ...promptConfig,
        promptMessage: "Autentique com reconhecimento facial para registrar o ponto",
      });
      if (!result.success) {
        Alert.alert("Erro", "Autenticação falhou ou foi cancelada.");
        return;
      }
    } else if (hasFingerprint) {
      const result = await LocalAuthentication.authenticateAsync({
        ...promptConfig,
        promptMessage: "Autentique com digital para registrar o ponto",
      });
      if (!result.success) {
        Alert.alert("Erro", "Autenticação falhou ou foi cancelada.");
        return;
      }
    } else if (hasIrisRecognition) {
      const result = await LocalAuthentication.authenticateAsync({
        ...promptConfig,
        promptMessage: "Autentique com reconhecimento de íris para registrar o ponto",
      });
      if (!result.success) {
        Alert.alert("Erro", "Autenticação falhou ou foi cancelada.");
        return;
      }
    } else {
      // Se nenhum método biométrico estiver disponível ou todos falharem, tenta autenticação por senha
      const passwordResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Use a senha do dispositivo para registrar o ponto",
        cancelLabel: "Cancelar",
        fallbackLabel: "Cancelar",
        disableDeviceFallback: false, // Permite fallback para senha
      });
      if (!passwordResult.success) {
        Alert.alert("Erro", "Autenticação falhou ou foi cancelada.");
        return;
      }
    }

    const timeZone = 'America/Sao_Paulo';
    const date = new Date();

    // const tipo = 0;

    // Busca os pontos registrados
    const ultimoPonto: any = await userDatabase.buscarUltimoPonto(userIDFormat);

    console.log("Ultimo Ponto: " + ultimoPonto);

    // Verifica se existem pontos registrados
    if (ultimoPonto === null) {

      setTipo(1);
      await baterPonto(formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss'), tipo);
      setUltimoPontoReg(true);
      setUltimoPontoHor([formatInTimeZone(date, timeZone, 'HH:mm:ss')]);

      console.log("Ponto registrado!");
      return;
    }


    // Se já houver mais de 1 ponto registrado, verifica a lógica do horário limite
    if (ultimoPonto.length > 0) {

      setTipo(ultimoPonto.length + 1);

      const ultimoPontoMaisRecente = new Date(Date.parse(ultimoPonto[0].data));
      // Converte a string da API para objeto Date

      // Adiciona um minuto ao último ponto registrado para definir o horário limite
      const dataLimite = new Date(ultimoPontoMaisRecente.getTime() + 60 * 1000); // Adiciona 1 minuto

      console.log("Último ponto mais recente:", ultimoPontoMaisRecente);
      console.log("Data limite:", dataLimite);

      // A comparação é feita diretamente entre os objetos Date
      if (date < dataLimite) {
        Alert.alert("Aguarde", "Ponto já foi registrado!");
        return;
      }

      // if (ultimoPonto == 3) {

      // }

      if (ultimoPonto.length >= 4) {
        Alert.alert('aviso', 'Limite de batidas atigindo!');
        return;
      }

      await baterPonto(formatInTimeZone(date, timeZone, 'yyyy-MM-dd HH:mm:ss'), tipo);
    }


    // Se o ponto for válido para ser registrado
    setUltimoPontoReg(true);

    setUltimoPontoHor(
      Array.isArray(ultimoPonto)
        ? [
          formatInTimeZone(date, timeZone, 'HH:mm:ss'), // Novo ponto sempre no topo
          ...ultimoPonto.map(p => formatInTimeZone(p.data, timeZone, 'HH:mm:ss')) // Depois os anteriores
        ]
        : [formatInTimeZone(date, timeZone, 'HH:mm:ss')]
    );


    console.log("Ponto registrado e adicionado ao estado.");

  };

  const sincronizarPonto = async () => {

    // const timeZone = 'America/Sao_Paulo';

    try {
      const useDatabase = await useUserDatabase();
      const pontos: PontoPayload[] = await useDatabase.buscarPontosUsuario2(userIDFormat);

      if (!Array.isArray(pontos)) {
        throw new Error("Os pontos recebidos não são um array.");
      }

      for (const ponto of pontos) {

        // if (typeof ponto !== "object" || ponto === null) {
        //   console.warn("Ponto inválido encontrado:", ponto);
        //   return;
        // }
        console.log(ponto.data);
        console.log(typeof (ponto.data));
        const payload: { pontosRequest: PontoPayload[] } = {
          pontosRequest: [
            {
              userId: ponto.userId,
              username: ponto.username,
              empresa: ponto.empresa,
              tipo: ponto.tipo,
              data: ponto.data,
              diaDaSemana: ponto.diaDaSemana ?? "Desconhecido",
              latitude: ponto.latitude ?? null,
              longitude: ponto.longitude ?? null,
              createdAt: new Date(),
              updatedAt: new Date(),
              distancia: ponto.distancia ?? null,
              descricao: ponto.descricao ?? null,
              cliente_id: ponto.cliente_id ?? null,
              cliente_des: ponto.cliente_des ?? null,
              status: ponto.status ?? "novo",
              adm_id: ponto.adm_id ?? null,
              resposta: ponto.resposta ?? null,
              escala: escala ?? null,
              modeloBatida: modeloBatida ?? null,
              statusmsg: ponto.statusmsg ?? "OK",
              foto_path: ponto.foto_path ?? "foto.png",
              status_cod: ponto.status_cod ?? null,
            },
          ],
        };

        console.log(payload);

        const response = await api.post("/receberpontos", payload);
        if (!response.data.success) {
          console.log(`Erro ao sincronizar ponto ID ${ponto.userId}:`, response.data.message);
        }
      }

      Alert.alert("Aviso", "Pontos Sincronizados com Sucesso!");
    } catch (error) {
      console.log("Erro na sincronização:", error);
    }
  };


  return (

    <View style={styles.container}>
      <View style={styles.header}>
        {user && (<Text style={styles.empName}> {empresa}</Text>)}
        <Text style={styles.title}>{currentDate}</Text>
        {user && (<Text style={styles.welcomeMessage}>Bem vindo, <Text style={styles.title}>{user ? username : "Usuário não autenticado"}</Text>!</Text>)}
      </View>

      <View style={styles.containerCenter}>
        <Text style={styles.text}>Bater Ponto</Text>
        <TouchableOpacity
          onPress={handleBaterPonto}
          style={[
            styles.digitalButton,
            isButtonDisabled && styles.buttonDisabled // Aplica o estilo buttonDisabled se o botão estiver desabilitado
          ]}
          disabled={isButtonDisabled} // Desabilita o toque no botão baseado no estado
        >
          <Image source={require('../assets/digital.png')} style={styles.image} />
        </TouchableOpacity>
        {ultimoPontoReg ? (
          <View style={styles.ultimoPontoWrapper}>
            <Text style={styles.ultimoPontoTitle}>Últimos Pontos:</Text>
            {ultimoPontoHor && ultimoPontoHor.length > 0 ? (
              ultimoPontoHor.map((horario, index) => (
                <Text key={index} style={styles.ultimoPontoContainer}>- {horario.split(":").slice(0, 2).join(":")}</Text>
              ))
            ) : (
              <Text style={styles.ultimoPontoContainer}>Nenhum ponto registrado</Text>
            )}
          </View>
        ) : (
          <View style={styles.ultimoPontoWrapper}>
            <Text style={styles.ultimoPontoContainer}>Nenhum ponto registrado</Text>
          </View>
        )}




        {mensagemRetorno !== '' && <Text style={styles.mensagemRetorno}>{mensagemRetorno}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',

  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  digitalButton: {
    marginBottom: 56,
    //backgroundColor: '#FF6347',
    backgroundColor: '#2196F3',
    borderRadius: 50,
    padding: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC', // Cor de fundo quando o botão está desabilitado
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // Ajuste para que a imagem também tenha bordas arredondadas
  },
  ultimoPontoContainer: {
    // backgroundColor: "#f5f5f5", // Fundo cinza claro para destacar os horários
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    // color: "#333",
  },
  ultimoPontoWrapper: {
    // backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 2, // Sombra para Android
  },
  ultimoPontoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    // color: "#444",
  },
  mensagemRetorno: {
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    width: '80%',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeMessage: {
    fontSize: 16,
  },
  empName: {
    margin: 5,
    fontSize: 22,
    fontFamily: 'sans-serif',
    padding: 16
  },
  content: {
    flex: 1,
  },
});

export default PontoScreen;
