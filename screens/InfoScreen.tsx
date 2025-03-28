import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importe o locale que você vai usar
import NetInfo from '@react-native-community/netinfo';


import { useAuth } from '../contexts/AuthContext';
import api from '@/config/api';


const InfoScreen = () => {

  // Estado para armazenar os dados do usuário
  const { user, logout } = useAuth(); // Obtém o usuário do contexto
  const [apiVersion, setApiVersion] = useState<string | null>(null);

  const userData = user?.response?.[0] ?? user ?? {};

  console.log(userData);
  // Usa destructuring para pegar os valores, evitando repetição
  const {
    username,
    empresa,
    cliente,
    escala,
    cargo
  } = userData;


  let diaDaSemana: number;

  // if (user?.escala === 2) {
  //   diaDaSemana = 8; // Para escala 12x36
  // } else {
  //   const hoje = new Date().getDay();
  //   diaDaSemana = hoje === 0 ? 7 : hoje; // Ajuste para Domingo ser 7
  // }

  // Assegure-se que user.limitePonto é um objeto e diaDaSemana é uma chave válida desse objeto
  // const limiteHoje = user?.limitePonto ? user.limitePonto[diaDaSemana] : undefined;

  useEffect(() => {
    const fetchApiVersion = async () => {
      try {
        const response = await api.get("/apiversion");

        if (response.data?.apiversion) {
          setApiVersion(response.data.apiversion);
        } else {
          setApiVersion("Versão Indisponível");
        }
      } catch (error: any) {
        console.log(error.message);
        setApiVersion("Erro ao obter versão");
      }
    };

    fetchApiVersion();
  }, []);

  const formatDate = (date: string) => {
    // @ts-ignore
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };
  // const formatEscala = (escala: number) => {
  //   switch (escala) {
  //     case 0:
  //       return 'Normal';
  //     case 1:
  //       return '12x36';
  //     default:
  //       return 'Outras';
  //   }
  // };

  const showLogoutConfirmation = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        // Se o usuário estiver conectado à internet, mostre a confirmação de logout
        Alert.alert(
          "Confirmação de Logout",
          "Você realmente deseja sair?",
          [
            {
              text: "Cancelar",
              onPress: () => console.log("Logout cancelado"),
              style: "cancel"
            },
            { text: "Sair", onPress: () => preLogout() }
          ],
          { cancelable: false }
        );
      } else {
        // Se não estiver conectado à internet, informe ao usuário
        Alert.alert("Sem conexão", "Você precisa estar conectado à internet para fazer logout.");
      }
    });
    const preLogout = () => {
      // tentarEnviarPontosSalvos();
      logout();
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title2}>Informações do Usuário</Text>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.cardText}>Nome: <Text style={styles.title}>{user ? username : "Usuário não autenticado"}</Text>
          </Text>
          <Text style={styles.cardText}>Empresa: <Text style={styles.title}>{empresa}</Text></Text>
          <Text style={styles.cardText}>Cargo: <Text style={styles.title}>{cargo}</Text></Text>
          <Text style={styles.cardText}>Setor: <Text style={styles.title}>{cliente}</Text></Text>
          <Text style={styles.cardText}>Escala: <Text style={styles.title}>{escala}</Text></Text>
          {/* <Text style={styles.cardText}>Observação: <Text style={styles.title}>{observacao}</Text></Text> */}

          {/* <Text style={styles.cardText}>Padrão de Ponto:</Text> */}

          {/* <Text style={styles.cardText}>
            Pontos na jornada hoje: {limiteHoje ? limiteHoje : 'Não disponível'}
          </Text> */}

          {/* <Text style={styles.cardText}>Escala: {formatEscala(user.escala)}</Text> */}
          {/* <Text style={styles.cardText}>Versão da API: {user.version}</Text> */}

          <Text style={styles.cardText}>Versão da API: <Text style={styles.title}>{apiVersion ?? "Carregando..."}</Text></Text>
          {/* <Text style={styles.cardText}>Data do Login: {formatDate(user.date)}</Text> */}
        </View>
      ) : (
        <Text style={styles.cardText}>Carregando informações do usuário...</Text>
      )}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={showLogoutConfirmation} style={styles.button}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title2: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardText: {
    fontSize: 16,
    marginVertical: 5,
  },
  logoutContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: 'red', // Cor do botão
    padding: 12, // Espaçamento interno
    width: 100,
    borderRadius: 5, // Borda arredondada
  },
  buttonText: {
    color: 'white', // Cor do texto
    fontSize: 16,
    textAlign: 'center', // Alinhamento do texto
  },
});

export default InfoScreen;