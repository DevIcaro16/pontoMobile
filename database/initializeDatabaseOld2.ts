import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const dbName = './expert_db.db';
const dbPath = FileSystem.documentDirectory + dbName;

export const DatabaseConnection = {
    getConnection: async () => {
        // Verificar se o arquivo do banco de dados já existe no diretório
        const fileInfo = await FileSystem.getInfoAsync(dbName);

        if (!fileInfo.exists) {
            console.log('Banco de dados não encontrado, realizando a cópia...');

            // Copiar o banco de dados de assets para o diretório de documentos do dispositivo
            try {
                // Usando Asset.fromModule para acessar o arquivo dentro de assets
                const asset = Asset.fromModule(require('./expert_db.db')); // Atualize o caminho para o arquivo correto
                await asset.downloadAsync(); // Baixar o asset se necessário

                // Copiar o banco de dados para o diretório de documentos
                await FileSystem.copyAsync({
                    from: asset.localUri!,
                    to: dbName,
                });

                console.log('Banco de dados copiado com sucesso!');
            } catch (error) {
                console.error('Erro ao copiar o banco de dados:', error);
                throw new Error('Erro ao copiar o banco de dados');
            }
        } else {
            console.log('Banco de dados encontrado no caminho:', dbPath);
        }

        // Abrir a conexão com o banco de dados
        const db = await SQLite.openDatabaseAsync(dbPath);
        return db;
    },


    deleteDatabase: async () => {
        try {
            await FileSystem.deleteAsync(dbPath);
            console.log("Banco de dados excluído com sucesso.");
        } catch (error) {
            console.log("Erro ao excluir banco de dados:", error);
        }
    }
};
