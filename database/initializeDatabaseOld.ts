import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
    // CREATE TABLE IF NOT EXISTS users(

    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     empresa TEXT NOT NULL,
    //     username TEXT NOT NULL,
    //     password TEXT NOT NULL

    // );

    // INSERT INTO  users(empresa, username, password) VALUES ("UVC", "icaro", "123");
    // INSERT INTO  users(empresa, username, password) VALUES ("UVC", "bruno", "321");
    // INSERT INTO  users(empresa, username, password) VALUES ("UVC", "sergio", "312");

    // CREATE TABLE IF NOT EXISTS pontos(

    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     username TEXT NOT NULL,
    //     departament_name TEXT NOT NULL,
    //     time TIMESTAMP,
    //     device TEXT NOT NULL,
    //     user_id INT,

    //     FOREIGN KEY (user_id) REFERENCES users(id)

    // );

    await database.execAsync(
        `
            CREATE TABLE IF NOT EXISTS spi_emp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emp TEXT NOT NULL,
            nome TEXT NOT NULL,
            razao_social TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS spi_cbo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            emp TEXT NOT NULL,
            cbo TEXT NOT NULL ,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (emp) REFERENCES spi_emp(emp) ON DELETE CASCADE ON UPDATE CASCADE
        );

            CREATE TABLE IF NOT EXISTS spi_cli (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            endereco TEXT NOT NULL,
            latitude REAL DEFAULT NULL,
            longitude REAL DEFAULT NULL,
            emp TEXT NOT NULL,
            cli TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (emp) REFERENCES spi_emp(emp) ON DELETE CASCADE ON UPDATE CASCADE
        );


            CREATE TABLE IF NOT EXISTS spi_fun (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                login TEXT NOT NULL ,
                senha TEXT NOT NULL,
                adm INTEGER DEFAULT 0,
                id_cbo INTEGER DEFAULT NULL,
                id_escala INTEGER DEFAULT NULL,
                emp_id INTEGER NOT NULL, -- Relacionando pelo ID de 'spi_emp'
                cli_id INTEGER NOT NULL, -- Relacionando pelo ID de 'spi_cli'
                mat TEXT NOT NULL ,
                data_inicio DATE DEFAULT NULL,
                data_termino DATE DEFAULT NULL,
                foto_perfil TEXT DEFAULT NULL,
                foto_doc TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ativo INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (emp_id) REFERENCES spi_emp(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (cli_id) REFERENCES spi_cli(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (id_cbo) REFERENCES spi_cbo(id) ON DELETE SET NULL ON UPDATE CASCADE
            );

            CREATE TABLE IF NOT EXISTS spi_hor (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT NOT NULL ,
                descricao TEXT NOT NULL,
                entrada1 TIME NOT NULL,
                saida1 TIME NOT NULL,
                entrada2 TIME NOT NULL,
                saida2 TIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tolerancia_minutos INTEGER NOT NULL DEFAULT 5,
                totdia REAL NOT NULL DEFAULT 0.00,
                totext REAL NOT NULL DEFAULT 0.00,
                totadc REAL NOT NULL DEFAULT 0.00,
                totint REAL NOT NULL DEFAULT 0.00
            );

            CREATE TABLE IF NOT EXISTS spi_pon (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                departament_name TEXT,
                time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                device TEXT,
                user_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES spi_fun(id)
            );


        `
    );

}