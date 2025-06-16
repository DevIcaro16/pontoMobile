import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function RelogioHoraAtual() {

    const [horaAtual, setHoraAtual] = useState<string>("");
    const [minutoAtual, setMinutoAtual] = useState<string>("");
    const [segundoAtual, setSegundoAtual] = useState<string>("");
    const horarioCompleto: string[] = [];

    useEffect(() => {
        const atualizarHorario = () => {

            const data = new Date();

            const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).format(data);

            const [horas, minutos, segundos] = horaFormatada.split(':');

            setHoraAtual(horas);
            setMinutoAtual(minutos);
            setSegundoAtual(segundos);
        };

        atualizarHorario();
        const intervalo = setInterval(atualizarHorario, 1000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.relogioTexto}>{horaAtual}</Text>
            <Text style={styles.relogioTexto}>{minutoAtual}</Text>
            <Text style={styles.relogioTexto}>{segundoAtual}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

        borderRadius: 10,
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
        paddingHorizontal: 20,
        marginTop: 12,

        alignItems: 'center',
        justifyContent: 'center',
    },
    relogioTexto: {
        backgroundColor: '#2196F3', // Azul vibrante
        width: 64,
        textAlign: 'center',
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#0052aa',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF', // Preto marcante
    },
});
