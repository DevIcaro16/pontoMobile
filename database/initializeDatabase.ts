import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {

    await database.execAsync(
        `

        -- Tabela de Empresas (spi_emp)
        CREATE TABLE IF NOT EXISTS spi_emp (
            nmr_empresa INTEGER PRIMARY KEY,
            cep TEXT,
            endereco TEXT,
            numero TEXT,
            bairro TEXT,
            complemento TEXT,
            cidade TEXT,
            uf TEXT
        );

        -- Tabela de Setores / Clientes (spi_cli)
        CREATE TABLE IF NOT EXISTS spi_cli (
            idsetor INTEGER PRIMARY KEY AUTOINCREMENT,
            nomesetor TEXT NOT NULL
        );

        -- Tabela de usuarios (spi_fun)
        CREATE TABLE IF NOT EXISTS spi_user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            login TEXT UNIQUE NOT NULL, 
            senha TEXT NOT NULL,
            c_senha TEXT NOT NULL,
            empresa TEXT
        );

         -- tabela marcacoes
         CREATE TABLE IF NOT EXISTS spi_pon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id CHAR(5) NOT NULL,
            time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            latitude VARCHAR(255) NOT NULL,
            longitude VARCHAR(255) NOT NULL
        );

        `
    );
}
