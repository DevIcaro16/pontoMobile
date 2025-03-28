import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";

export type UserDatabaseProps = {
    id: number;
    userId: string | number;
    empresa: string;
    username: string;
    password: string;
    // time?: string;
    data?: string;
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

            for (const empresa of empresas) {
                const existing = existingEmpresas.find(e => e.chave === empresa.chave);

                if (existing) {
                    if (existing.descricao !== empresa.descricao) {
                        await db.runAsync(
                            `UPDATE spi_emp SET descricao = ?, updatedAt = CURRENT_TIMESTAMP WHERE chave = ?`,
                            [empresa.descricao, empresa.chave]
                        );
                        console.log(`Empresa ${empresa.chave} atualizada.`);
                    }
                } else {
                    await db.runAsync(
                        `INSERT INTO spi_emp (chave, descricao) VALUES (?, ?)`,
                        [empresa.chave, empresa.descricao]
                    );
                    console.log(`Empresa ${empresa.chave} inserida.`);
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

            for (const setor of setores) {
                const existing = existingSetores.find(s => s.chave === setor.chave);

                if (existing) {
                    if (
                        existing.descricao !== setor.descricao ||
                        existing.latitude !== setor.latitude ||
                        existing.longitude !== setor.longitude ||
                        existing.empresa !== setor.empresa ||
                        existing.endereco !== setor.endereco ||
                        existing.distancia !== setor.distancia
                    ) {
                        await db.runAsync(
                            `UPDATE spi_cli SET descricao = ?, latitude = ?, longitude = ?, empresa = ?, endereco = ?, distancia = ?, updatedAt = CURRENT_TIMESTAMP WHERE chave = ?`,
                            [
                                setor.descricao,
                                setor.latitude,
                                setor.longitude,
                                setor.empresa,
                                setor.endereco,
                                setor.distancia,
                                setor.chave
                            ]
                        );
                        console.log(`Cliente ${setor.chave} atualizado.`);
                    }
                } else {
                    await db.runAsync(
                        `INSERT INTO spi_cli (chave, descricao, latitude, longitude, empresa, endereco, distancia) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [setor.chave, setor.descricao, setor.latitude, setor.longitude, setor.empresa, setor.endereco, setor.distancia]
                    );
                    console.log(`Setor ${setor.chave} inserido.`);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar setores:", error);
        }
    }

    async function sincronizarFuncoes(funcoes: any[]) {

        const db = await getDatabase();

        try {
            console.log("Verificando funções existentes...");
            const existingFuncoes = await db.getAllAsync("SELECT * FROM spi_funcoes");

            for (const funcao of funcoes) {
                const existing = existingFuncoes.find(f => f.id === funcao.id);

                if (existing) {
                    if (
                        existing.cbo !== funcao.cbo ||
                        existing.des !== funcao.des ||
                        existing.slb !== funcao.slb ||
                        existing.slc !== funcao.slc
                    ) {
                        await db.runAsync(
                            `UPDATE spi_funcoes 
                             SET cbo = ?, des = ?, slb = ?, slc = ?, updatedAt = CURRENT_TIMESTAMP 
                             WHERE id = ?`,
                            [funcao.cbo, funcao.des, funcao.slb, funcao.slc, funcao.id]
                        );
                        console.log(`Função ${funcao.des} atualizada.`);
                    }
                } else {
                    await db.runAsync(
                        `INSERT INTO spi_funcoes (id, cbo, des, slb, slc) 
                         VALUES (?, ?, ?, ?, ?);`,
                        [
                            funcao.id || '',
                            funcao.cbo || 'Função Padrão',
                            funcao.des || 'Descrição Padrão',
                            funcao.slb || 0.0,
                            funcao.slc || 0.0
                        ]
                    );
                    console.log(`Função ${funcao.des} inserida.`);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar funções:", error);
        }
    }


    async function sincronizarUsuarios(usuarios: any[]) {
        const db = await getDatabase();

        try {
            console.log("Verificando usuários existentes...");
            const existingUsuarios = await db.getAllAsync("SELECT * FROM spi_user");

            for (const usuario of usuarios) {
                const existing = existingUsuarios.find(u => u.id === usuario.id);

                if (existing) {
                    if (
                        existing.id !== usuario.id ||
                        existing.nome !== usuario.nome ||
                        existing.username !== usuario.username ||
                        existing.password !== usuario.password ||
                        existing.empresa !== usuario.empresa ||
                        existing.cliente !== usuario.cliente ||
                        existing.email !== usuario.email ||
                        existing.phone !== usuario.phone ||
                        existing.funcao_id !== usuario.funcao_id
                    ) {
                        await db.runAsync(
                            `UPDATE spi_user 
                             SET id = ?, nome = ?, username = ?, password = ?, empresa = ?, cliente = ?, email = ?, phone = ?, funcao_id = ?, updatedAt = CURRENT_TIMESTAMP 
                             WHERE cpf = ?`,
                            [usuario.id, usuario.nome, usuario.username, usuario.password, usuario.empresa, usuario.cliente, usuario.email, usuario.phone, usuario.funcao_id, usuario.cpf]
                        );
                        console.log(`Usuário ${usuario.username} ${usuario.empresa} ${usuario.password} atualizado.`);
                    }
                } else {
                    await db.runAsync(
                        `INSERT INTO spi_user (id, empresa, username, password, nome, cliente, email, phone, cpf, funcao_id) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [
                            usuario.id || '',
                            usuario.empresa || '',
                            usuario.username || '',
                            usuario.password || '',
                            usuario.nome || '',
                            usuario.cliente || '',
                            usuario.email || '',
                            usuario.phone || '',
                            usuario.cpf || '00000000000', // CPF padrão para evitar erro
                            usuario.funcao_id  // Define como null caso não tenha função associada
                        ]
                    );
                    console.log(`Usuário ${usuario.username} inserido.`);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar usuários:", error);
        }
    }




    async function baterPonto(
        userId: string,
        username: string,
        empresa: string,
        tipo: number,
        data: string,
        diaDaSemana: string,
        latitude: string,
        longitude: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        const db = await getDatabase();

        // Converter Date para string no formato SQLite
        const createdAtStr = createdAt.toISOString().replace("T", " ").split(".")[0];
        const updatedAtStr = updatedAt.toISOString().replace("T", " ").split(".")[0];

        try {
            const result = await db.runAsync(
                `INSERT INTO spi_pon (userId, username, empresa, tipo, data, diaDaSemana, latitude, longitude, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [userId, username, empresa, tipo, data, diaDaSemana, latitude, longitude, createdAtStr, updatedAtStr]
            );
            console.log("Ponto registrado com sucesso:", result);

            return "Ponto registrado!";
        } catch (error) {
            console.error("Erro ao bater ponto:", error);
            return "Erro ao registrar ponto!";
        }
    }



    async function login(emp: string, nome: string, senha: string) {

        const db = await getDatabase();

        try {

            const querySeachEmpresaUsername = `
                SELECT *
                       FROM spi_user AS user
                       WHERE user.empresa = ? AND user.username = ?;
            `;



            const responseSeachEmpresaUsername = await db.getAllAsync<UserDatabaseProps>(querySeachEmpresaUsername, [emp, nome]);
            console.log(responseSeachEmpresaUsername);

            if (responseSeachEmpresaUsername.length > 0) {

                console.log("Password: " + responseSeachEmpresaUsername[0].password);
                const passDB = responseSeachEmpresaUsername[0].password;


                if (passDB != senha) {
                    return "Senha Inválida!";
                }


                return responseSeachEmpresaUsername.length > 0 ? responseSeachEmpresaUsername : null;
            } else {
                return "Empresa ou Usuários Inválidos!";
            }


        } catch (error) {
            console.error("Erro no login:", error);
            return null;
        } finally {
            // db.closeAsync();
        }
    }

    async function buscarEmpresas() {

        const db = await getDatabase();

        try {
            const query = `SELECT * FROM spi_emp;`;

            const response = await db.getAllAsync<UserDatabaseProps>(query);
            console.log(response);
        } catch (error) {
            console.log(error);
        } finally {
            // db.closeAsync();
        }
    }

    async function buscarUltimoPonto(userID: string) {
        const db = await getDatabase();

        try {
            const query = `
                SELECT * 
                FROM spi_pon 
                WHERE userId = ? 
                AND DATE(data) = DATE('now', 'localtime') 
                ORDER BY data DESC 
                LIMIT 4
            `;

            const response: any[] = await db.getAllAsync(query, [userID]);

            return response.length > 0 ? response : null;
        } catch (error) {
            console.error("Erro ao buscar último ponto:", error);
            return null;
        }
    }


    async function buscarPontosUsuario(userID: string) {
        const db = await getDatabase();
        const dataAtual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

        try {
            const query = `
                SELECT id, userId, TIME(data) AS data 
                FROM spi_pon 
                WHERE userId = ? AND DATE(data) = ? 
                ORDER BY data ASC 
                LIMIT 4
            `;

            const response = await db.getAllAsync<UserDatabaseProps>(query, [userID, dataAtual]);

            console.log(response);

            if (response.length > 0) {
                return response.map(item => item.data); // Retorna apenas os horários
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar pontos do usuário:", error);
            return null;
        }
    }

    async function buscarPontosUsuario2(userID: string) {
        const db = await getDatabase();
        const dataAtual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

        try {
            const query = `
                SELECT * 
                FROM spi_pon 
                WHERE userId = ? AND DATE(data) = ? 
                ORDER BY data ASC 
                LIMIT 4
            `;

            const response = await db.getAllAsync<UserDatabaseProps>(query, [userID, dataAtual]);

            console.log(response);

            if (response.length > 0) {
                return response;
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar pontos do usuário:", error);
            return null;
        }
    }

    async function buscarTodosPontosUsuario(userID: string) {
        const db = await getDatabase();
        const dataAtual = new Date().toISOString().split("T")[0];
        console.log(dataAtual)
        try {
            const query = `SELECT id, userId, TIME(time) AS time FROM spi_pon WHERE userId = ? AND DATE(time) = ? ORDER BY time ASC`;
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
            DROP TABLE IF EXISTS spi_funcoes;
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
        sincronizarFuncoes,
        sincronizarUsuarios,
        buscarEmpresas,
        login,
        baterPonto,
        buscarUltimoPonto,
        buscarPontosUsuario,
        buscarPontosUsuario2,
        buscarTodosPontosUsuario
    };
}
