import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext'; // Ajuste o caminho conforme necessário
import * as LocalAuthentication from 'expo-local-authentication'; //Leitor de digital, etc
import NetInfo from '@react-native-community/netinfo';
import { addMinutes, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale'; // Importa o locale do Português do Brasil
import { useUserDatabase } from '@/database/useUserDatabase';
import api from '@/config/api';
import RelogioHoraAtual from '@/components/HoraAtual';
import MonitorConexao from '@/components/MonitorConexao';
import * as Network from 'expo-network';

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
  modeloBatida: number | null;
  statusmsg: string;
  foto_path: string;
  status_cod: number | null;
}


const PontoScreen = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto
  const [conectadoWifi, setConectadoWifi] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);


  // const [ultimoPontoReg, setUltimoPontoReg] = useState<{ hora: string; tipo: string; tipoDesc: string } | null>(null);
  const [mensagemRetorno, setMensagemRetorno] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [ultimoPontoReg, setUltimoPontoReg] = useState<boolean>(false);
  const [ultimoPontoHor, setUltimoPontoHor] = useState<Array<string | Date>>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [tipo, setTipo] = useState<number>(0);
  const [localizacao, setLocalizacao] = useState<string | null>(null);

  function formatDate(date: Date) {
    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getDayOfWeek(date: Date) {
    const fullDay = format(date, "EEEE", { locale: ptBR });
    const fullDayUpper = capitalize(fullDay.split("-")[0]);
    return fullDayUpper // Retorna "Quinta"
  }
  // Uso da função
  const currentDate = formatDate(new Date());

  const userDatabase = useUserDatabase();


  const buscarPontosUsuario = async () => {
    if (!userID) return [];
    const response = await userDatabase.buscarPontosUsuario(userIDFormat);
    return response;
  };


  const carregarPontos = async () => {
    try {
      const pontosDoDia = await buscarPontosUsuario();
      if (pontosDoDia && pontosDoDia.length > 0) {
        setUltimoPontoReg(true);
        const pontosDifUndefined = pontosDoDia.filter(ponto => ponto != undefined);
        console.log('carregarPontos: ')
        console.log(pontosDifUndefined);
        setUltimoPontoHor(pontosDifUndefined);
        setTipo(pontosDoDia.length + 1);
        //console.log('setUltimoPontoHor' + pontosDoDia + "-" + pontosDoDia.length);
      }
    } catch (error) {
      console.error("Erro ao buscar pontos diários do usuário:", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão negada", "Você precisa permitir o acesso à localização.");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (location?.coords?.latitude !== undefined && location?.coords?.longitude !== undefined) {
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        Alert.alert("Erro", "Não foi possível obter sua localização.");
      }
    })();
  }, []);

  useEffect(() => {
    const verificarConexao = async () => {
      try {
        const status = await Network.getNetworkStateAsync();
        setConectadoWifi(status.type === Network.NetworkStateType.WIFI);
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
      }
    };

    verificarConexao();

    // Verifica a conexão a cada 3 segundos
    const intervalo = setInterval(verificarConexao, 3000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (user) {
      carregarPontos();
    }
  }, [user]);

  const userID = user?.id ?? '';

  useEffect(() => {
    const sincronizarBatidas = async () => {

      // Se o Wi-Fi, não sincroniza
      if (!conectadoWifi) return;

      try {
        const response = await api.post("/sincronizarBatidas", {
          userId: userID
        });


        if (response.status === 200) {
          const pontos = response.data.pontos || []; // Garante que seja sempre um array

          const useDatabase = await useUserDatabase();

          if (pontos.length > 0) {
            //console.log(`Encontrados ${pontos.length} pontos para sincronizar.`);

            await useDatabase.sincronizarBatidasPonto(userID);
          } else {
            //console.log("Nenhum ponto encontrado para sincronizar.");
            await useDatabase.sincronizarBatidasPonto(userID);
            Alert.alert('Aviso', 'Nenhum ponto para sincronizar!');
          }
        } else {
          console.error("Erro na sincronização:", response.data.message);
        }
      } catch (error: any) {
        // Se o erro for 404, trata como resposta vazia em vez de erro
        if (error.response?.status === 404) {
          //console.log("Nenhum ponto encontrado para sincronizar (404).");
          Alert.alert('Aviso', 'Nenhum ponto para sincronizar!');
        } else {
          console.error("Erro na sincronização:", error);
        }
      }

      carregarPontos();
    };

    sincronizarBatidas();
  }, [conectadoWifi]);

  useEffect(() => {
    async function obterLocalizacao() {
      if (location) {
        const resultado = await buscarLocalizacaoAtual(location);
        setLocalizacao(resultado);
      }
    }

    obterLocalizacao();
  }, [location, user]);

  // const empresa = user?.empresa || null;
  const empresa = user?.empresa ?? '';
  const empdes = user?.empdes ?? '';
  const cliente = user?.cliente ?? '';
  const localemp = user?.localemp ?? '';

  const username = user?.username ?? '';
  const escala = user?.escala ?? '';
  const modeloBatida = user?.modeloBatida ?? 0;

  function padNumber(num: number) {
    return num.toString().padStart(5, '0');
  }

  async function buscarLocalizacaoAtual(location: {
    latitude: number;
    longitude: number;
  }) {
    if (!cliente) return 'Indefinida!';

    const latitudeStr = location.latitude.toString();
    const longitudeStr = location.longitude.toString();

    try {
      const verificarDistancia = await userDatabase.verificarLocalizacao(cliente, latitudeStr, longitudeStr);
      return verificarDistancia.isValid ? localemp : 'Indefinida!';
    } catch (error) {
      console.error("Erro ao verificar localização:", error);
      return 'Indefinida!';
    }
  }


  const userIDFormat = padNumber(Number(userID));

  async function baterPonto(dataFormatada: Date, tipo: number): Promise<boolean> {
    if (!location) {
      Alert.alert("Erro", "Localização não disponível. Aguarde...");
      return false;
    }

    const latitudeStr = location.latitude.toString();
    const longitudeStr = location.longitude.toString();

    const verificarDistancia = await userDatabase.verificarLocalizacao(cliente, latitudeStr, longitudeStr);

    if (!verificarDistancia.isValid) {
      return new Promise((resolve) => {
        Alert.alert(
          "Aviso",
          verificarDistancia.message,
          [
            {
              text: "Voltar",
              onPress: () => {
                //console.log("Registro de Ponto Cancelado!");
                resolve(false); // Retorna false se o usuário cancelar
              },
              style: "cancel"
            },
            {
              text: "Continuar",
              onPress: async () => {
                //console.log("DEU CERTO!");
                const resultado = await baterPontoNoBanco(dataFormatada, tipo);
                resolve(resultado); // Retorna o resultado da inserção no banco
              }
            }
          ],
          { cancelable: false }
        );
      });
    } else {
      return await baterPontoNoBanco(dataFormatada, tipo);
    }


  }

  async function baterPontoNoBanco(dataFormatada: Date, tipo: number): Promise<boolean> {

    const latitudeStr = location?.latitude.toString() ?? '';
    const longitudeStr = location?.longitude.toString() ?? '';

    const verificarDistancia = await userDatabase.verificarLocalizacao(cliente, latitudeStr, longitudeStr);

    const distancia = verificarDistancia.distancia ?? null;

    const response = await userDatabase.baterPonto(
      userIDFormat,
      username,
      empresa,
      cliente,
      tipo,
      dataFormatada,
      distancia ?? 0,
      getDayOfWeek(new Date()),
      location.latitude.toString(),
      location.longitude.toString(),
      new Date(),
      new Date()
    );

    if (response.isSuccess) {
      return new Promise((resolve) => {
        Alert.alert(
          "Aviso",
          response.message,
          [
            {
              text: "Ok",
              onPress: () => {
                //// console.log("Sincronização cancelada");
                resolve(true); // Mesmo cancelando a sincronização, o ponto foi batido
              },
              // style: "cancel"
            },
            // {
            //   text: "Sincronizar",
            //   onPress: () => {
            //     sincronizarPonto();
            //     resolve(true); // O ponto foi batido e a sincronização começou
            //   }
            // }
          ],
          { cancelable: true }
        );
      });
    }

    return false; // Se a inserção falhou
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

    // const timeZone = 'America/Sao_Paulo';
    const date = new Date();
    const dateTimeZoneBr = new Date(date.setHours(date.getHours() - 3));

    // const tipo = 0;

    // Busca os pontos registrados
    const ultimoPonto: any = await userDatabase.buscarUltimoPonto(userIDFormat);

    //console.log("Ultimo Ponto: " + ultimoPonto);

    // Verifica se existem pontos registrados
    if (ultimoPonto === null) {

      setTipo(1);
      const response = await baterPonto(dateTimeZoneBr, tipo);
      if (!response) {
        return;
      }
      setUltimoPontoReg(true);

      setUltimoPontoHor(
        Array.isArray(ultimoPonto)
          ? [
            dateTimeZoneBr, // Novo ponto sempre no topo
            ...ultimoPonto.map(p => p.data) // Depois os anteriores
          ]
          : [dateTimeZoneBr]
      );
      return;
    }


    // Se já houver mais de 1 ponto registrado, verifica a lógica do horário limite
    if (ultimoPonto.length > 0) {

      setTipo(ultimoPonto.length + 1);
      const agora = new Date();
      const dateTimeZoneBr = new Date(agora.getTime() - 3 * 60 * 60 * 1000); // Ajuste para fuso horário do Brasil

      const ultimoPontoMaisRecenteUTC = new Date(ultimoPonto[0].data); // aqui converte corretamente
      const ultimoPontoMaisRecente = new Date(ultimoPontoMaisRecenteUTC.getTime() - 3 * 60 * 60 * 1000);
      const dataLimite = new Date(ultimoPontoMaisRecente.getTime() + 60 * 1000); // +1 min

      //// console.log(ultimoPontoMaisRecente)
      //// console.log("Data BR atual:", dateTimeZoneBr.toLocaleString("pt-BR"));
      //// console.log("Último ponto (corrigido):", ultimoPontoMaisRecente.toLocaleString("pt-BR"));
      //// console.log("Data limite:", dataLimite.toLocaleString("pt-BR"));
      //// console.log(dateTimeZoneBr)
      //// console.log(dataLimite)

      if (dateTimeZoneBr < dataLimite) {
        Alert.alert("Aguarde", "Ponto já foi registrado!");
        return;
      }




      if (ultimoPonto.length >= 4) {
        Alert.alert('aviso', 'Limite de batidas atigindo!');
        return;
      }

      const res = await baterPonto(dateTimeZoneBr, tipo);

      if (!res) {
        return;
      }

      setUltimoPontoReg(true);


      if (Array.isArray(ultimoPonto)) {
        ultimoPonto.forEach((p, i) => {
          console.log(`p[${i}] =`, p);
          console.log(`p.data =`, p?.data);
        });
      }
      setUltimoPontoHor(
        Array.isArray(ultimoPonto)
          ? [
            dateTimeZoneBr, // Novo ponto sempre no topo (já está no formato desejado?)
            ...ultimoPonto.map(p => {
              const dataStr = p?.data;
              return typeof dataStr === 'string' && dataStr.length >= 19
                ? dataStr.substring(11, 19) // Pega apenas "hh:mm:ss"
                : '--:--:--';
            })
          ]
          : [dateTimeZoneBr]
      );



      //console.log("Ponto registrado e adicionado ao estado.");
    }

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

        //console.log(ponto.data);
        //console.log(typeof (ponto.data));
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

        //console.log(payload);

        const response = await api.post("/receberpontos", payload);
        if (!response.data.success) {
          //console.log(`Erro ao sincronizar ponto ID ${ponto.userId}:`, response.data.message);
        }
      }

      Alert.alert("Aviso", "Pontos Sincronizados com Sucesso!");
    } catch (error) {
      //console.log("Erro na sincronização:", error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user && (<Text style={styles.empName}> {empdes}</Text>)}
        {user && (
          <Text style={styles.welcomeMessage}>
            Bem vindo, <Text style={styles.title}>{user ? username : "Usuário não autenticado"}</Text>!
          </Text>
        )}
        <Text style={styles.title}>{currentDate}</Text>
        {user && (
          <Text style={styles.localAtual}>
            Localização Atual: <Text style={styles.title}>{localizacao ?? 'Carregando...'}</Text>
          </Text>
        )}
        {
          localizacao === 'Indefinida!' && (
            <>
              <Text style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: 16 }}>
                {`Latitude: ${location?.latitude}`}
              </Text>
              <Text style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: 16 }}>
                {`Longitude: ${location?.longitude}`}
              </Text>
            </>
          )

        }
        {/* <MonitorConexao /> */}
      </View>

      <RelogioHoraAtual />

      <View style={styles.containerCenter}>
        {/* <Text style={styles.text}>Bater Ponto</Text> */}
        <TouchableOpacity
          onPress={handleBaterPonto}
          style={[
            styles.digitalButton,
            isButtonDisabled && styles.buttonDisabled
          ]}
          disabled={isButtonDisabled}
        >
          <Image source={require('../assets/digital.png')} style={styles.image} />
        </TouchableOpacity>

        {ultimoPontoReg ? (
          <View style={styles.ultimoPontoWrapper}>
            <Text style={styles.ultimoPontoTitle}>Últimos Pontos:</Text>
            {ultimoPontoHor.length > 0 ? (
              ultimoPontoHor.map((horario, index) => {
                //console.log("horario:", horario, "tipo:", typeof horario);

                return (
                  <Text key={index} style={styles.ultimoPontoContainer}>
                    {typeof horario === "string"
                      ? horario.split(":").slice(0, 2).join(":")
                      : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                );
              })
            ) : (
              <Text style={styles.ultimoPontoContainer}>Nenhum ponto registrado</Text>
            )}
          </View>
        ) : (
          <View style={styles.ultimoPontoWrapper}>
            <Text style={styles.ultimoPontoContainer}>Nenhum ponto registrado</Text>
          </View>
        )}

        {/* {mensagemRetorno !== '' && <Text style={styles.mensagemRetorno}>{mensagemRetorno}</Text>} */}
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
    marginTop: -8,
    padding: 10,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  digitalButton: {
    marginBottom: 26,
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
    width: 130,
    height: 130,
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
    padding: 2,
    borderRadius: 10,
    marginTop: 2,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 2, // Sombra para Android
  },
  ultimoPontoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
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
  localAtual: {
    margin: 5,
    fontSize: 18,
    fontFamily: 'sans-serif',
    padding: 16
  },
  content: {
    flex: 1,
  },
});

export default PontoScreen;
export default PontoScreen;