import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Network from 'expo-network';
import { MaterialIcons } from '@expo/vector-icons';

export default function MonitorConexao() {
    const [conectadoWifi, setConectadoWifi] = useState<boolean | null>(null);

    useEffect(() => {
        const verificarConexao = async () => {
            const status = await Network.getNetworkStateAsync();
            setConectadoWifi(status.type === Network.NetworkStateType.WIFI);
        };

        verificarConexao();

        // Verifica a conexão a cada 3 segundos
        const intervalo = setInterval(verificarConexao, 3000);

        return () => clearInterval(intervalo);
    }, []);


    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <MaterialIcons
                name={conectadoWifi ? 'wifi' : 'wifi-off'}
                size={32}
                color={conectadoWifi ? 'green' : 'red'}
            />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: conectadoWifi ? 'green' : 'red' }}>
                {conectadoWifi ? 'Conectado' : 'Sem Conexão'}
            </Text>
        </View>
    );
}
