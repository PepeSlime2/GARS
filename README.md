# GARS - Gestão Ambiental de Resíduos Sólidos ♻️

Sistema web completo de monitoramento em tempo real do nível de resíduos através de dispositivos IoT conectados ao Supabase.

## 📋 Características

- **Backend Node.js + Express** conectado ao Supabase
- **Interface moderna e responsiva** com paleta ecológica
- **Gráfico dinâmico** com histórico de níveis (Chart.js)
- **Lixeira 3D animada** que muda de cor e altura conforme os dados (Three.js)
- **Indicadores visuais** com status Normal, Atenção e Crítico
- **Atualização automática** a cada 10 segundos

## 🚀 Como Executar

### 1️⃣ Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 2️⃣ Iniciar o Servidor Backend

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

### 3️⃣ Abrir o Frontend

Abra o arquivo `frontend/index.html` em um navegador web moderno ou use um servidor local:

```bash
cd frontend
# Usando Python 3
python -m http.server 8080

# Ou usando Node.js (se tiver http-server instalado)
npx http-server -p 8080
```

Acesse: `http://localhost:8080`

## 📁 Estrutura do Projeto

```
GARS/
├── backend/
│   ├── server.js          # Servidor Express com API
│   └── package.json       # Dependências do backend
├── frontend/
│   ├── index.html         # Interface HTML
│   ├── styles.css         # Estilos CSS
│   └── script.js          # Lógica JavaScript + Three.js
└── README.md              # Este arquivo
```

## 🔌 API Endpoints

- `GET /api/status` - Status do servidor
- `GET /api/niveis` - Retorna os últimos 20 registros
- `GET /api/niveis/latest` - Retorna apenas o registro mais recente

## 🎨 Paleta de Cores

- **Verde** (#4CAF50) - Nível 0: Vazia (espaço livre > 25cm)
- **Amarelo** (#FFC107) - Nível 1: Meio Cheia
- **Vermelho** (#F44336) - Nível 2: Cheia (crítico)

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js
- Express
- node-fetch
- CORS

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript (ES6+)
- Chart.js (gráficos)
- Three.js (visualização 3D)
- Google Fonts (Poppins)

## 📊 Conexão com Supabase

O sistema está configurado para conectar à tabela `niveis` no Supabase com os seguintes campos:
- `nivel` - Valor inteiro do nível de resíduos:
  - **0** = Vazia (espaço livre > 25cm)
  - **1** = Meio Cheia
  - **2** = Cheia (crítico)
- `created_at` - Timestamp da leitura

## ⚙️ Configurações

Para alterar as credenciais do Supabase, edite o arquivo `backend/server.js`:

```javascript
const SUPABASE_URL = 'sua-url-aqui';
const SUPABASE_APIKEY = 'sua-apikey-aqui';
const SUPABASE_BEARER = 'seu-bearer-token-aqui';
```

## 🎯 Funcionalidades do Dashboard

1. **Gráfico de Linha**: Mostra evolução dos níveis ao longo do tempo
2. **Indicador de Status**: Badge colorido com classificação atual
3. **Barra de Progresso**: Representação visual do nível atual
4. **Lixeira 3D Animada**:
   - Rotação contínua
   - Mudança de cor conforme status
   - Altura do lixo ajustada ao nível
   - Símbolo de reciclagem
   - Efeito de balanço em status crítico
5. **Estatísticas**: Total de leituras e alertas críticos
6. **Indicador de Conexão**: Status da conexão com o backend

## 🔄 Atualização Automática

O sistema busca novos dados a cada 10 segundos automaticamente. Para alterar o intervalo, modifique a constante no `frontend/script.js`:

```javascript
const UPDATE_INTERVAL = 10000; // em milissegundos
```

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- Desktop (layout em duas colunas)
- Tablet (layout adaptável)
- Mobile (layout em coluna única)

## 🛠️ Desenvolvimento

Para desenvolvimento com auto-reload, instale o nodemon:

```bash
cd backend
npm install -D nodemon
npm run dev
```

## 📝 Licença

ISC

---

Desenvolvido para monitoramento inteligente de resíduos sólidos ♻️
