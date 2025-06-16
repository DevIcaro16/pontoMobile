import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {

    await database.execAsync(

        `

        -- Tabela de Empresas (spi_emp)
        CREATE TABLE IF NOT EXISTS spi_emp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chave TEXT UNIQUE NOT NULL,
            descricao TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabela de Setores / Clientes (spi_cli)
        CREATE TABLE IF NOT EXISTS spi_cli (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chave TEXT UNIQUE NOT NULL,
            descricao TEXT,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            empresa TEXT,
            endereco TEXT,
            distancia INTEGER DEFAULT 100,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empresa) REFERENCES spi_emp(chave) ON DELETE RESTRICT ON UPDATE RESTRICT
        );


        CREATE TABLE IF NOT EXISTS spi_funcoes (
            id  INTEGER PRIMARY KEY AUTOINCREMENT,
            cbo VARCHAR(255) NOT NULL,
            des VARCHAR(255) NOT NULL,
            slb FLOAT NOT NULL,
            slc FLOAT NOT NULL
        );



        -- Tabela de usuários (spi_user)
        CREATE TABLE IF NOT EXISTS spi_user (
            id INTEGER PRIMARY KEY DEFAULT 0,
            empresa TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            latitudeCantoSuperiorEsquerdo DECIMAL(9,6),
            longitudeCantoSuperiorEsquerdo DECIMAL(9,6),
            latitudeCantoInferiorDireito DECIMAL(9,6),
            longitudeCantoInferiorDireito DECIMAL(9,6),
            verificacaoLocalizacaoObrigatoria BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            nome TEXT,
            cliente TEXT,
            escala INTEGER DEFAULT 0,
            modeloBatida INTEGER DEFAULT 1,
            Address TEXT,
            Gender TEXT,
            birthdate DATE,
            phone TEXT,
            email TEXT,
            Status TEXT,
            posto TEXT,
            matricula TEXT,
            cpf TEXT,
            multicliente INTEGER DEFAULT 0,
            modeloposto INTEGER DEFAULT 1,
            ferias INTEGER DEFAULT 0,
            ina INTEGER DEFAULT 0, 
            ultbat TEXT,
            funcao_id INTEGER NOT NULL,
            FOREIGN KEY (funcao_id) REFERENCES spi_funcoes(id) ON DELETE RESTRICT ON UPDATE CASCADE
            FOREIGN KEY (empresa) REFERENCES spi_emp(chave) ON UPDATE RESTRICT,
            FOREIGN KEY (cliente) REFERENCES spi_cli(chave) ON DELETE RESTRICT ON UPDATE RESTRICT
        );

        -- Tabela de Parâmetros (spi_par)
        CREATE TABLE IF NOT EXISTS spi_par(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empresa_id INTEGER NOT NULL,
            empresa_chave VARCHAR(255) NOT NULL,
            empresa_nome VARCHAR(255) NOT NULL,
            batida_automatica VARCHAR(255),
            tolerancia_cod CHAR(3),
            cerca_cod CHAR(3),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMPL,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS spi_req (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_mat VARCHAR(20),
            adm_id INTEGER,
            ponto_id INTEGER,
            status VARCHAR(255),
            titulo VARCHAR(255),
            descricao TEXT,
            resposta TEXT,
            anexo VARCHAR(255),
            categoria VARCHAR(255),
            subcategoria VARCHAR(255),
            adm_name VARCHAR(100),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            empresa VARCHAR(200),
            data_inicio DATE,
            data_termino DATE
        );


        -- Tabela de marcações (spi_pon)
        CREATE TABLE IF NOT EXISTS spi_pon (
            id INTEGER PRIMARY KEY,
            userId INTEGER NOT NULL,
            username varchar(255) NOT NULL,
            empresa varchar(255) NOT NULL,
            tipo INTEGER NOT NULL ,
            data datetime NOT NULL,
            diaDaSemana varchar(255) NOT NULL,
            latitude decimal(10,6) DEFAULT NULL,
            longitude decimal(10,6) DEFAULT NULL,
            createdAt datetime NOT NULL,
            updatedAt datetime NOT NULL,
            distancia INTEGER DEFAULT NULL,
            descricao varchar(255) DEFAULT NULL,
            cliente_id INTEGER DEFAULT NULL,
            cliente_des varchar(200) DEFAULT NULL,
            status varchar(200) DEFAULT 'novo',
            adm_id INTEGER DEFAULT NULL,
            resposta varchar(200) DEFAULT NULL,
            escala INTEGER DEFAULT NULL,
            modeloBatida INTEGER DEFAULT NULL,
            statusmsg varchar(200) DEFAULT 'OK',
            foto_path TEXT,
            status_cod INTEGER DEFAULT NULL,
            retflg CHAR(1) DEFAULT ''
        );
    `);
}
