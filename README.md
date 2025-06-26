# Ponto Digital - README Técnico

## Descrição
O **Ponto Digital** é um aplicativo mobile desenvolvido em React Native com Expo, focado no registro de ponto eletrônico, controle de jornada e funcionalidades de RH para empresas e colaboradores. O app integra recursos de geolocalização, autenticação, exportação de dados e sincronização com uma API ExpressJS hospedada na nuvem.

---

## Stacks e Tecnologias Utilizadas

- **Frontend Mobile:**
  - [React Native](https://reactnative.dev/) (0.76.9)
  - [Expo](https://expo.dev/) (~52.0.46)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Expo Router](https://expo.github.io/router/) (file-based routing)
  - [EAS CLI](https://docs.expo.dev/eas/) (build e deploy)
  - [Yarn](https://yarnpkg.com/) ou npm

- **Navegação e UI:**
  - @react-navigation (stack, bottom-tabs)
  - @expo/vector-icons, MaterialIcons
  - Componentes customizados (HoraAtual, MonitorConexao, UserTabNavigation)

- **Banco de Dados Local:**
  - [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (banco local SQLite, tabelas customizadas)
  - Sincronização e inicialização automática das tabelas (empresas, usuários, funções, pontos, etc)

- **API e Integração Backend:**
  - [Axios](https://axios-http.com/) para requisições HTTP
  - Integração com API ExpressJS hospedada em [Vercel](https://vercel.com/) (`https://api-ponto.vercel.app`)
  - Endpoints: login, sincronização, exportação, histórico, etc.

- **Funcionalidades Extras:**
  - Geolocalização: [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
  - Autenticação biométrica: [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
  - Monitoramento de conexão: @react-native-community/netinfo
  - Exportação de dados: expo-file-system, expo-sharing
  - Mapas: react-native-maps
  - Máscara de input: react-native-masked-text

---

## Funcionalidades Principais

- **Login seguro** com autenticação via API
- **Registro de ponto** com validação de localização e horário
- **Histórico de pontos** com visualização em lista e mapa
- **Exportação de registros** para arquivo e envio para servidor
- **Sincronização automática** de dados locais com a API
- **Monitoramento de conexão** (WiFi, dados móveis)
- **Suporte a múltiplas empresas, setores e funções**
- **Autenticação biométrica** (digital, facial)
- **Interface responsiva** e navegação por abas

---

## Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone <repo-url>
   cd Ponto
   ```
2. **Instale as dependências:**
   ```bash
   yarn install
   # ou
   npm install
   ```
3. **Inicie o app em modo desenvolvimento:**
   ```bash
   npx expo start
   ```
4. **Build e Deploy (EAS):**
   ```bash
   eas build --platform android
   # ou
   eas build --platform ios
   ```

---

## Configurações Importantes
- O app utiliza permissões de localização e internet (ver `app.json`).
- O banco local é inicializado automaticamente na primeira execução.
- A URL da API pode ser alterada em `config/api.ts`.
- Para resetar o projeto para o estado inicial, use:
  ```bash
  npm run reset-project
  ```

---

## Estrutura de Pastas
- `app/` - Rotas e telas principais
- `components/` - Componentes reutilizáveis
- `contexts/` - Contextos globais (ex: autenticação)
- `database/` - Inicialização e uso do banco SQLite
- `config/` - Configurações de API
- `screens/` - Telas do app (Login, Ponto, Histórico, Exportar, Info)
- `hooks/` - Hooks customizados

---

## Observações
- O projeto está pronto para build e deploy via EAS.
- A API ExpressJS deve estar operacional para login e sincronização.
- O app pode ser testado em emuladores Android/iOS ou dispositivos físicos via Expo Go.

---

## Contato e Suporte
Para dúvidas, sugestões ou suporte, entre em contato com o desenvolvedor responsável. 