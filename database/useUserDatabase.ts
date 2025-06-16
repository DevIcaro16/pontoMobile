import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "./initializeDatabase";
import { getDistance } from 'geolib';
import api from "@/config/api";


export type UserDatabaseProps = {
    id: number;
    userId: string | number;
    empresa: string;
    username: string;
    password: string;
    // time?: string;
    data?: string;
    latitude: string;
    longitude: string;
    distancia: number;
};

interface BaterPontoResponse {
    isSuccess: boolean;
    outLocation: boolean | null;
    message: string;
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
            console.log("Limpando tabela spi_cli...");
            await db.runAsync("DELETE FROM spi_cli;");

            for (const setor of setores) {
                await db.runAsync(
                    `INSERT INTO spi_cli (chave, descricao, latitude, longitude, empresa, endereco, distancia) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        setor.chave || '',
                        setor.descricao || '',
                        setor.latitude || 0, // Define 0 como padrão caso esteja indefinido
                        setor.longitude || 0, // Define 0 como padrão caso esteja indefinido
                        setor.empresa || '',
                        setor.endereco || '',
                        setor.distancia || 0 // Define 0 como padrão caso esteja indefinido
                    ]
                );
                // console.log(`Setor ${setor.chave} - ${setor.distancia}  inserido.`);
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
                    // console.log(`Função ${funcao.des} inserida.`);
                }
            }
        } catch (error) {
            console.error("Erro ao sincronizar funções:", error);
        }
    }


    async function sincronizarUsuarios(usuarios: any[]) {
        const db = await getDatabase();

        try {
            console.log("Limpando tabela spi_user...");
            await db.runAsync("DELETE FROM spi_user;");

            for (const usuario of usuarios) {
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
                        usuario.funcao_id  // Pode ser null caso não tenha função associada
                    ]
                );
                // console.log(`Usuário ${usuario.username} - ${usuario.empresa} inserido.`);
            }
        } catch (error) {
            console.error("Erro ao sincronizar usuários:", error);
        }
    }


    async function sincronizarParametros(parametros: any[]) {

        const db = await getDatabase();

        try {
            console.log("Limpando tabela spi_par...");
            await db.runAsync("DELETE FROM spi_par;");

            for (const parametro of parametros) {
                await db.runAsync(
                    `INSERT INTO spi_par (id, empresa_id, empresa_chave, empresa_nome, batida_automatica, tolerancia_cod, cerca_cod) 
                     VALUES (?, ?, ?, ?, ?, ?, ?);`,
                    [
                        parametro.id || '',
                        parametro.empresa_id || '',
                        parametro.empresa_chave || '',
                        parametro.empresa_nome || '',
                        parametro.batida_automatica || '',
                        parametro.tolerancia_cod || '',
                        parametro.cerca_cod || '',
                    ]
                );
                console.log(`Parâmetro ${parametro.batida_automatica} inserido.`);
            }
        } catch (error) {
            console.error("Erro ao sincronizar os Parâmetros:", error);
        }
    }

    async function sincronizarRequisicoes(requisicoes: any[]) {
        const db = await getDatabase();

        try {
            console.log("Limpando tabela requisicoes...");
            await db.runAsync("DELETE FROM spi_req;");

            for (const req of requisicoes) {
                await db.runAsync(
                    `INSERT INTO sip_req (
                        id, user_id, user_mat, adm_id, ponto_id, status, titulo,
                        descricao, resposta, anexo, categoria, subcategoria,
                        adm_name, createdAt, updatedAt, empresa, data_inicio, data_termino
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        req.id || null,
                        req.user_id || null,
                        req.user_mat || '',
                        req.adm_id || null,
                        req.ponto_id || null,
                        req.status || '',
                        req.titulo || '',
                        req.descricao || '',
                        req.resposta || '',
                        req.anexo || '',
                        req.categoria || '',
                        req.subcategoria || '',
                        req.adm_name || '',
                        req.empresa || '',
                        req.data_inicio || null,
                        req.data_termino || null
                    ]
                );
                console.log(`Requisição ${req.id} inserida.`);
            }

        } catch (error) {
            console.error("Erro ao sincronizar as Requisições:", error);
        }
    }


    async function verificarLocalizacao(cliente: string, latitude: string, longitude: string) {
        const db = await getDatabase();

        try {
            console.log(cliente);
            const consultarLocalizacaoPonto = 'SELECT latitude, longitude, distancia FROM spi_cli WHERE chave = ?';
            const resultConsultarLocalizaPonto = await db.getAllAsync<UserDatabaseProps>(consultarLocalizacaoPonto, [cliente]);

            const latitudeBD = resultConsultarLocalizaPonto[0]?.latitude ?? null;
            const longitudeBD = resultConsultarLocalizaPonto[0]?.longitude ?? null;

            if (latitudeBD !== null && longitudeBD !== null) {
                const distanciaMetros = getDistance(
                    { latitude: latitudeBD, longitude: longitudeBD },
                    { latitude, longitude }
                );

                console.log(`Distância calculada: ${distanciaMetros} metros`);

                const limiteDistancia = resultConsultarLocalizaPonto[0]?.distancia ?? 0;

                if (distanciaMetros > limiteDistancia) {

                    return {
                        isValid: false,
                        outLocation: true,
                        distancia: distanciaMetros,
                        message: `Ambiente fora da locação! Distância: ${distanciaMetros} m. Em caso de Dúvidas, comunique o Suporte!`
                    };

                }

                return {
                    isValid: true,
                    outLocation: false,
                    distancia: distanciaMetros
                };
            }

            return {
                isValid: false,
                outLocation: false,
                message: "Coordenadas Inválidas!"
            };
        } catch (error) {
            console.error("Erro ao verificar localização:", error);
            return {
                isValid: false,
                outLocation: false,
                message: "Erro ao verificar localização!"
            };
        }
    }

    async function baterPonto(
        userId: string,
        username: string,
        empresa: string,
        cliente: string,
        tipo: number,
        data: Date,
        distancia: number,
        diaDaSemana: string,
        latitude: string,
        longitude: string,
        createdAt: Date,
        updatedAt: Date
    ): Promise<BaterPontoResponse> {

        const db = await getDatabase();

        // Converter Date para string no formato SQLite
        const dataFormatada = data.toISOString().replace("T", " ").split(".")[0];
        console.log(data);
        const createdAtStr = createdAt.toISOString().replace("T", " ").split(".")[0];
        const updatedAtStr = updatedAt.toISOString().replace("T", " ").split(".")[0];

        try {


            const result = await db.runAsync(
                `INSERT INTO spi_pon (userId, username, empresa, tipo, data, distancia, diaDaSemana, latitude, longitude, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [userId, username, empresa, tipo, dataFormatada, distancia, diaDaSemana, latitude, longitude, createdAtStr, updatedAtStr]
            );
            console.log("Ponto registrado com sucesso:", result);

            return {
                isSuccess: true,
                outLocation: false,
                message: "Ponto registrado!"
            };

        } catch (error) {
            console.error("Erro ao bater ponto:", error);
            return {
                isSuccess: false,
                outLocation: false,
                message: "Erro ao registrar ponto!"
            };
        }
    }



    async function sincronizarBatidasPonto(userId: number): Promise<{ isSuccess: boolean; message: string }> {

        const db = await getDatabase();
        const periodo = 30; // últimos 30 dias
        const hoje = new Date();
        const dataInicio = new Date(hoje.setDate(hoje.getDate() - periodo)).toISOString().split("T")[0];
        const dataFim = new Date().toISOString().split("T")[0];

        // Função para ajustar fuso horário de UTC para UTC-3
        const ajustarFusoHorario = (data: string): string => {
            const dateObj = new Date(data);
            dateObj.setHours(dateObj.getHours() - 3);
            return dateObj.toISOString();
        };

        const arredondar = (num: number | string, casas = 6): number | null => {
            if (num === null) return null;
            return parseFloat(num.toFixed(casas));
        }

        try {
            const batidasLocais = await db.getAllAsync(
                `SELECT * FROM spi_pon WHERE userId = ? AND DATE(data) BETWEEN ? AND ?`,
                [userId, dataInicio, dataFim]
            );

            const response = await api.post("/sincronizarBatidas", { userId: userId });
            if (!response.data.success) {
                return { isSuccess: false, message: "Erro ao buscar dados do servidor" };
            }
            const batidasServidor = response.data.pontos;

            const mapaLocais = new Map(batidasLocais.map(b => [`${b.data}-${b.tipo}-${arredondar(b.latitude, 6)}-${arredondar(b.longitude, 6)}`, b]));
            const mapaServidor = new Map(batidasServidor.map(b => [`${b.data}-${b.tipo}-${b.latitude}-${b.longitude}`, b]));

            const novosParaLocal = [];
            const novosParaServidor = [];

            for (const [chave, batidaServidor] of mapaServidor) {
                if (!mapaLocais.has(chave)) {
                    // console.log(batidaServidor);
                    novosParaLocal.push(batidaServidor);
                } else {
                    const batidaLocal = mapaLocais.get(chave);
                    if (batidaLocal.updatedAt !== batidaServidor.updatedAt) {
                        await db.runAsync(
                            `UPDATE spi_pon SET 
                                username = ?, empresa = ?, tipo = ?, diaDaSemana = ?, 
                                distancia = ?, descricao = ?, cliente_id = ?, cliente_des = ?, 
                                status = ?, adm_id = ?, resposta = ?, escala = ?, modeloBatida = ?, 
                                statusmsg = ?, foto_path = ?, status_cod = ?, retflg = ?, updatedAt = ?
                            WHERE id = ?`,
                            [
                                batidaServidor.username,
                                batidaServidor.empresa,
                                batidaServidor.tipo,
                                batidaServidor.diaDaSemana,
                                batidaServidor.distancia ?? null,
                                batidaServidor.descricao ?? null,
                                batidaServidor.cliente_id ?? null,
                                batidaServidor.cliente_des ?? null,
                                batidaServidor.status ?? "novo",
                                batidaServidor.adm_id ?? null,
                                batidaServidor.resposta ?? null,
                                batidaServidor.escala ?? null,
                                batidaServidor.modeloBatida ?? null,
                                batidaServidor.statusmsg ?? "OK",
                                batidaServidor.foto_path ?? "foto.png",
                                batidaServidor.status_cod ?? null,
                                batidaServidor.retflg ?? '',
                                batidaServidor.updatedAt,
                                batidaServidor.id
                            ]
                        );
                    }
                }
            }

            for (const [chave, batidaLocal] of mapaLocais) {
                if (!mapaServidor.has(chave)) {
                    console.log(mapaServidor)
                    console.log(chave);
                    novosParaServidor.push(batidaLocal);
                }
            }

            // Inserção no banco local
            if (novosParaLocal.length > 0) {
                for (const batida of novosParaLocal) {
                    console.log('batida.data: ' + batida.data);
                    await db.runAsync(
                        //Insere ou Atualiza (Verifica se o registro existe)
                        `INSERT OR REPLACE INTO spi_pon (
                            id, userId, username, empresa, tipo, data, diaDaSemana, latitude, longitude, 
                            createdAt, updatedAt, distancia, descricao, cliente_id, cliente_des, status, 
                            adm_id, resposta, escala, modeloBatida, statusmsg, foto_path, status_cod, retflg
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [
                            batida.id, batida.userId, batida.username, batida.empresa, batida.tipo, batida.data,
                            batida.diaDaSemana, batida.latitude, batida.longitude, batida.createdAt,
                            batida.updatedAt, batida.distancia, batida.descricao, batida.cliente_id,
                            batida.cliente_des, batida.status, batida.adm_id, batida.resposta,
                            batida.escala, batida.modeloBatida, batida.statusmsg, batida.foto_path,
                            batida.status_cod, batida.retflg
                        ]
                    );
                }
            }

            // Enviar novos registros para o servidor
            if (novosParaServidor.length > 0) {
                try {
                    const responseEnvio = await api.post("/receberpontos", { pontosRequest: novosParaServidor });
                    if (!responseEnvio.data.success) {
                        return { isSuccess: false, message: "Erro ao reenviar pontos ao servidor!" };
                    }
                } catch (error) {
                    return { isSuccess: false, message: "Erro ao reenviar pontos ao servidor!" };
                }
            }

            return { isSuccess: true, message: "Sincronização concluída com sucesso!" };

        } catch (error) {
            return { isSuccess: false, message: "Erro na sincronização!" };
        }
    }




    async function login(emp: string, nome: string, senha: string) {

        const db = await getDatabase();

        try {

            const querySeachEmpresaUsername = `
                SELECT 
                    user.username, 
                    user.empresa, user.id,
                    user.password, user.escala,
                    user.cliente, user.funcao_id,
                    emp.descricao AS empdes,
                    funcoes.des AS cargo,
                    cli.descricao AS localemp 
                    FROM spi_user AS user 
                    INNER JOIN 
                    spi_funcoes AS funcoes ON user.funcao_id = funcoes.id
                    INNER JOIN 
                    spi_emp AS emp ON user.empresa = emp.chave
                    INNER JOIN 
                    spi_cli AS cli ON user.cliente = cli.chave
                    WHERE user.empresa = ? AND username = ?;
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

            console.log("Pontos do Usuário: " + response);

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

            // console.log(response);

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

            // console.log(response);
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
            DROP TABLE IF EXISTS spi_par;
            DROP TABLE IF EXISTS spi_pon;
            `
        );
        console.log("Todas as tabelas foram removidas!");
    }

    async function fReplace(
        table: string,
        campo: string,
        valorCampo: string,
        chave: number | string
    ): Promise<boolean> {

        try {

            const db = await getDatabase();

            let query = `UPDATE ${table} SET ${campo} = ?`;
            const values: any[] = [valorCampo];

            if (typeof chave === 'string' && chave.includes('-')) {
                const partes = chave.split('-');
                if (partes.length % 2 !== 0) {
                    throw new Error('Formato da chave inválido. Deve conter pares de campo-valor.');
                }

                const whereConditions = [];
                for (let i = 0; i < partes.length; i += 2) {
                    const campoChave = partes[i];
                    const valorChave = partes[i + 1];
                    whereConditions.push(`${campoChave} = ?`);
                    values.push(valorChave);
                }

                query += ` WHERE ${whereConditions.join(' AND ')}`;
            } else {
                // Chave simples
                query += ` WHERE id = ?`;
                values.push(chave);
            }

            const response = await db.getAllAsync(query, values);
            return response.length > 0;

        } catch (error) {
            console.log('Erro:' + error);
            return false;
        }
    }

    const arredondar = (num: number | string, casas = 6): number | null => {
        if (num === null) return null;
        return parseFloat(num.toFixed(casas));
    }

    async function retificarPontoLocal(
        data: Date,
        tipo: number | null,
        latitude: string,
        longitude: string,
        userId: string,
        pontoId: number | null,
        titulo: string,
        descricao: string,
        anexo: string,
        subCategoria: string,
        dataInicio: Date,
        dataTermino: Date
    ) {

        try {

            const db = await getDatabase();

            const dataInicioFormatada = dataInicio.toISOString().replace("T", " ").split(".")[0];
            const dataTerminoFormatada = dataTermino.toISOString().replace("T", " ").split(".")[0];

            const query = `
                INSERT INTO spi_req 
                (user_id, ponto_id, titulo, descricao, anexo, subCategoria, data_inicio, data_termino)
                VALUES
                (?,?,?,?,?,?,?);
            `;

            const response = await db.getAllAsync<UserDatabaseProps>(query,
                [
                    userId, pontoId, titulo, descricao, anexo,
                    subCategoria, dataInicioFormatada, dataTerminoFormatada
                ]
            );

            if (response.length > 0) {
                const chave = 'data-' + { data } + 'tipo-' + { tipo } + 'latitude-' + { latitude } + 'longitude-' + { longitude };
                const atualizarCampoRetFLG = await fReplace('spi_pon', 'retflg', '1', chave);
                if (atualizarCampoRetFLG) {
                    console.log('Retificação gravada localmente com Sucesso!');
                }
            } else {
                return false;
            }


        } catch (error) {
            console.log(error);
            return false;
        }

    }


    // dropTables();

    return {
        sincronizarEmpresas,
        sincronizarSetores,
        sincronizarFuncoes,
        sincronizarUsuarios,
        sincronizarParametros,
        sincronizarRequisicoes,
        verificarLocalizacao,
        login,
        baterPonto,
        sincronizarBatidasPonto,
        buscarUltimoPonto,
        buscarPontosUsuario,
        buscarPontosUsuario2,
        buscarTodosPontosUsuario,
        fReplace,
        retificarPontoLocal
    };
}
