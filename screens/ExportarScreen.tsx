import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useUserDatabase } from '@/database/useUserDatabase';
import NetInfo from '@react-native-community/netinfo';

import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import axios from 'axios';

async function exportar(userID: number, username: string, userDatabase: any) {
    try {
        // 1️⃣ Buscar pontos batidos do usuário
        const pontos = await userDatabase.buscarPontosUsuario(userID);
        if (!pontos || pontos.length === 0) {
            Alert.alert("Nenhum ponto encontrado");
            return;
        }

        // 2️⃣ Formatar o conteúdo do arquivo
        const primeiraBatida = new Date(pontos[0].time);
        const mesReferencia = format(primeiraBatida, "MMMM-yyyy"); // Nome do mês e ano
        console.log(mesReferencia);

        const meses = {
            "January": "01",
            "February": "02",
            "March": "03",
            "April": "04",
            "May": "05",
            "June": "06",
            "July": "07",
            "August": "08",
            "September": "09",
            "October": "10",
            "November": "11",
            "December": "12"
        };

        // Extrai mês e ano da string "MMMM-yyyy"
        const [mes, ano] = mesReferencia.split("-");

        // Constrói a referência no formato "MM-YYYY"
        const mesRefBR = meses[mes] ? `${meses[mes]}-${ano}` : "";

        console.log(mesRefBR);
        // Se não encontrar, retorna string vazia

        console.log(mesRefBR);
        const nomeArquivo = `pontos_${username}_${mesRefBR}.txt`;

        let conteudo = "ID      Nome          Nome do Departamento         Tempo      Dispositivo      ID\n";
        conteudo += "                                                                           \n";

        // 3️⃣ Formatar cada linha
        pontos.forEach(ponto => {
            let id = ponto.id.toString().padEnd(8); // ID com 8 caracteres
            let nome = ponto.username.padEnd(14); // Nome com 14 caracteres
            let depto = ponto.departament_name.padEnd(22); // Departamento com 17 caracteres
            let tempo = format(new Date(ponto.time), "HH:mm:ss").padEnd(11); // Tempo com 11 caracteres
            let dispositivo = ponto.device.padEnd(17); // Dispositivo com 13 caracteres
            let userID = ponto.user_id.toString().padEnd(6); // ID final com 6 caracteres

            conteudo += `${id}${nome}${depto}${tempo}${dispositivo}${userID}\n`;
        });


        const caminhoArquivo = `${FileSystem.documentDirectory}${nomeArquivo}`;
        await FileSystem.writeAsStringAsync(caminhoArquivo, conteudo, { encoding: FileSystem.EncodingType.UTF8 });


        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Erro", "O compartilhamento de arquivos não é suportado neste dispositivo.");
            return;
        }


        try {

            const apiUrl = `https://www.sistemasgeo.com.br/spiceponto/pontos.php`;
            const response = await axios.post(apiUrl, {
                caminhoArquivo,
                conteudo
            });


            if (!response.data.success) {
                Alert.alert("Erro: " + response.data.message);
            }

            if (response.data.success) {
                Alert.alert("Dados Enviados com Sucesso!");
            }


        } catch (error) {
            console.log(error);
        }

        // await Sharing.shareAsync(caminhoArquivo);

    } catch (error) {
        console.error(error);
        Alert.alert("Erro ao exportar" + error);
    }
}

async function exportarPontos(userID: number, username: string, userDatabase: any) {

    NetInfo.fetch().then(state => {
        if (state.isConnected) {

            Alert.alert(
                "Confirmação de Exportação",
                "Deseja exportar seus dados?",
                [
                    {
                        text: "Cancelar",
                        onPress: () => console.log("Exportação cancelada"),
                        style: "cancel"
                    },
                    { text: "Enviar", onPress: () => exportar(userID, username, userDatabase) }
                ],
                { cancelable: false }
            );

        } else {
            Alert.alert("Sem conexão", "Você precisa estar conectado à internet para fazer a Exportação.");
        }

    });

}

const ExportarScreen = () => {

    const { user } = useAuth();
    const userID = user.response[0].id || null;
    const username = user.response[0].nome || null;
    const userDatabase = useUserDatabase();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => exportarPontos(userID, username, userDatabase)}>
                <Text style={styles.buttonText}>Exportar Horários</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 20,
        borderRadius: 16,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 24,
    },
});

export default ExportarScreen;
