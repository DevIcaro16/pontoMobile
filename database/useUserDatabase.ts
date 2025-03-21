import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";

export type UserDatabaseProps = {
    id: number;
    user_id: number;
    empresa: string;
    username: string;
    password: string;
    time?: string;
};

export async function getDatabase() {
    const db = SQLite.openDatabaseSync("spice_ponto.db");
    await initializeDatabase(db);
    return db;
}

export function useUserDatabase() {

    async function sincronizarEmpresas(empresas: any[]) {
        const db = await getDatabase();

        try {
            console.log("Verificando empresas existentes...");
            const existingEmpresas = await db.getAllAsync("SELECT * FROM spi_emp");

            console.log('Empresas existentes:', existingEmpresas);

            if (existingEmpresas.length === 0) {
                console.log("Tabela vazia, inserindo empresas...");
                // Se a tabela estiver vazia, insere todos os dados
                for (const empresa of empresas) {
                    await db.runAsync(
                        `INSERT INTO spi_emp (nmr_empresa, endereco, bairro, cidade, uf, cep, numero, complemento) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            empresa.nmr_empresa,
                            empresa.endereco,
                            empresa.bairro,
                            empresa.cidade,
                            empresa.uf,
                            empresa.cep,
                            empresa.numero,
                            empresa.complemento
                        ]
                    );
                }
                console.log("Empresas inseridas com sucesso!");
                return;
            }

            // Verifica se há diferenças entre os dados locais e os recebidos
            for (const empresa of empresas) {
                const existing: any = existingEmpresas.find(e => e.nmr_empresa === empresa.nmr_empresa);

                if (existing) {
                    if (
                        existing.endereco !== empresa.endereco ||
                        existing.bairro !== empresa.bairro ||
                        existing.cidade !== empresa.cidade ||
                        existing.uf !== empresa.uf ||
                        existing.cep !== empresa.cep ||
                        existing.numero !== empresa.numero ||
                        existing.complemento !== empresa.complemento
                    ) {
                        await db.runAsync(
                            `UPDATE spi_emp 
                             SET endereco = ?, bairro = ?, cidade = ?, uf = ?, cep = ?, numero = ?, complemento = ? 
                             WHERE nmr_empresa = ?`,
                            [
                                empresa.endereco,
                                empresa.bairro,
                                empresa.cidade,
                                empresa.uf,
                                empresa.cep,
                                empresa.numero,
                                empresa.complemento,
                                empresa.nmr_empresa
                            ]
                        );
                        console.log(`Empresa ${empresa.nmr_empresa} atualizada.`);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar empresas:", error);
        }
    }

    async function sincronizarSetores(setores: any[]) {
        const db = await getDatabase();

        try {
            console.log("Verificando setores existentes...");
            const existingSetores = await db.getAllAsync("SELECT * FROM spi_cli");

            console.log('Setores existentes:', existingSetores);

            if (existingSetores.length === 0) {
                console.log("Tabela vazia, inserindo setores...");
                // Se a tabela estiver vazia, insere todos os dados
                for (const setor of setores) {
                    await db.runAsync(
                        `INSERT INTO spi_cli (nomesetor) 
                         VALUES (?)`,
                        [
                            setor.nomesetor,
                        ]
                    );
                }
                console.log("Setores inseridos com sucesso!");
                return;
            }

            // Verifica se há diferenças entre os dados locais e os recebidos
            for (const setor of setores) {
                const existing: any = existingSetores.find(e => e.idsetor === setor.idsetor);

                if (existing) {
                    if (
                        existing.nomesetor !== setor.nomesetor
                    ) {
                        await db.runAsync(
                            `UPDATE spi_cli 
                             SET nomesetor = ?
                             WHERE idsetor = ?`,
                            [
                                setor.idsetor,
                                setor.nomesetor,
                            ]
                        );
                        console.log(`Setor ${setor.idsetor} atualizado.`);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar setores:", error);
        }
    }

    async function sincronizarUsuarios(usuarios: any[]) {
        const db = await getDatabase();

        try {
            console.log("Verificando usuários existentes...");
            const existingUsuarios = await db.getAllAsync("SELECT * FROM spi_user");

            console.log('Usuários existentes:', existingUsuarios);

            if (existingUsuarios.length === 0) {
                console.log("Tabela vazia, inserindo usuários...");
                // Se a tabela estiver vazia, insere todos os dados
                for (const usuario of usuarios) {
                    await db.runAsync(
                        `INSERT INTO spi_user (nome, cpf, login, senha, c_senha, empresa) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            usuario.nome,
                            usuario.cpf,
                            usuario.login,
                            usuario.senha,
                            usuario.c_senha,
                            // usuario.empresa
                        ]
                    );
                }
                console.log("Usuários inseridos com sucesso!");
                return;
            }

            // Verifica se há diferenças entre os dados locais e os recebidos
            for (const usuario of usuarios) {
                const existing: any = existingUsuarios.find(e => e.cpf === usuario.cpf);

                if (existing) {
                    if (
                        existing.nome !== usuario.nome ||
                        existing.login !== usuario.login ||
                        existing.senha !== usuario.senha ||
                        existing.c_senha !== usuario.c_senha ||
                        existing.empresa !== usuario.empresa
                    ) {
                        await db.runAsync(
                            `UPDATE spi_user 
                             SET nome = ?, login = ?, senha = ?, c_senha = ?, empresa = ? 
                             WHERE cpf = ?`,
                            [
                                usuario.nome,
                                usuario.login,
                                usuario.senha,
                                usuario.c_senha,
                                // usuario.empresa,
                                usuario.cpf
                            ]
                        );
                        console.log(`Usuário ${usuario.cpf} atualizado.`);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar usuários:", error);
        }
    }



    async function baterPonto(userID: string, time: string, latitude: string, longitude: string) {
        const db = await getDatabase();

        try {
            const result = await db.runAsync(
                `INSERT INTO spi_pon (user_id, time, latitude, longitude) VALUES (?, ?, ?, ?)`,
                [userID, time, latitude, longitude] // Correção: parâmetros devem ser passados como array
            );
            console.log("Ponto registrado com sucesso:", result);

            return "Ponto registrado!";
        } catch (error) {
            console.error("Erro ao bater ponto:", error);
            return "Erro ao registrar ponto!";
        } finally {
            db.closeAsync();
        }
    }


    async function login(emp: string, nome: string, senha: string) {
        const db = await getDatabase();

        try {

            const query = `
                SELECT * FROM spi_fun
                WHERE empresa = ? AND nome = ? AND senha = ?
            `;

            const response = await db.getAllAsync<UserDatabaseProps>(query, [emp, nome, senha]);
            console.log(response);

            return response.length > 0 ? response : null;
        } catch (error) {
            console.error("Erro no login:", error);
            return null;
        } finally {
            db.closeAsync();
        }
    }

    async function buscarUltimoPonto(userID: string) {
        const db = await getDatabase();

        try {
            const query = `SELECT * FROM spi_pon WHERE user_id = ? ORDER BY time DESC LIMIT 4`;
            const response: any = await db.getAllAsync(query, [userID]);

            if (response.length > 0) {
                // console.log("Último ponto:", response);
                // response.forEach(ponto => {
                //     console.log(ponto.time)
                // });
                return response;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar último ponto:", error);
            return null;
        } finally {
            db.closeAsync();
        }
    }

    async function buscarPontosUsuario(userID: string) {
        const db = await getDatabase();
        const dataAtual = new Date().toISOString().split("T")[0];
        console.log(dataAtual)
        try {
            const query = `SELECT id, user_id, TIME(time) AS time FROM spi_pon WHERE user_id = ? AND DATE(time) = ? ORDER BY time ASC LIMIT 4`;
            const response = await db.getAllAsync<UserDatabaseProps>(query, [userID, dataAtual]);

            console.log(response);
            if (response.length > 0) {
                const timesArray = response.map(item => item.time);
                return timesArray;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar pontos do usuário:", error);
            return null;
        } finally {
            // db.closeAsync();
        }
    }


    async function buscarTodosPontosUsuario(userID: string) {
        const db = await getDatabase();
        const dataAtual = new Date().toISOString().split("T")[0];
        console.log(dataAtual)
        try {
            const query = `SELECT id, user_id, TIME(time) AS time FROM spi_pon WHERE user_id = ? AND DATE(time) = ? ORDER BY time ASC`;
            const response = await db.getAllAsync<UserDatabaseProps>(query, [userID, dataAtual]);

            console.log(response);
            if (response.length > 0) {
                const timesArray = response.map(item => item.time);
                return timesArray;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar pontos do usuário:", error);
            return null;
        } finally {
            // db.closeAsync();
        }
    }

    async function dropTables() {
        const db = await getDatabase();

        await db.execAsync(
            `
            DROP TABLE IF EXISTS spi_emp;
            DROP TABLE IF EXISTS spi_cli;
            DROP TABLE IF EXISTS spi_fun;
            DROP TABLE IF EXISTS spi_pon;
            `
        );
        console.log("Todas as tabelas foram removidas!");
    }

    // dropTables();

    return {
        sincronizarEmpresas,
        sincronizarSetores,
        sincronizarUsuarios,
        login,
        baterPonto,
        buscarUltimoPonto,
        buscarPontosUsuario,
        buscarTodosPontosUsuario
    };
}
