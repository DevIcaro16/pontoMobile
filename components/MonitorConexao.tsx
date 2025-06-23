import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';

export default function MonitorConexao() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [connectionType, setConnectionType] = useState<string>('');

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
            setConnectionType(state.type || '');
        });

        // Verificação inicial
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected ?? false);
            setConnectionType(state.type || '');
        });

        return () => unsubscribe();
    }, []);

    const getConnectionIcon = () => {
        if (!isConnected) return 'wifi-off';

        switch (connectionType) {
            case 'wifi':
                return 'wifi';
            case 'cellular':
                return 'signal-cellular-4-bar';
            case 'ethernet':
                return 'router';
            default:
                return 'wifi';
        }
    };

    const getConnectionText = () => {
        if (!isConnected) return 'Sem Conexão';

        switch (connectionType) {
            case 'wifi':
                return 'WiFi';
            case 'cellular':
                return 'Dados Móveis';
            case 'ethernet':
                return 'Ethernet';
            default:
                return 'Conectado';
        }
    };

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <MaterialIcons
                name={getConnectionIcon()}
                size={32}
                color={isConnected ? 'green' : 'red'}
            />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: isConnected ? 'green' : 'red' }}>
                {getConnectionText()}
            </Text>
        </View>
    );
}
