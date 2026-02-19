🧠 Quiz Master AI - Plataforma de Aprendizado Evolutivo
Este projeto é uma aplicação de Quiz full-stack desenvolvida com foco em Arquitetura Limpa, Persistência de Dados Auditável e Inteligência Artificial.

🚀 Diferenciais de Nível Sênior
Service Layer Pattern: Separação rigorosa entre lógica de negócio (Services) e protocolos de comunicação (Controllers).

IA Pedagógica: Integração com Google Gemini 1.5 Flash para explicar erros gramaticais ou conceituais em tempo real no histórico.

Resiliência de Dados: Sistema de "Manual Join" no histórico, permitindo recuperar relações complexas do banco de dados sem sobrecarregar o schema.

UX Dinâmica: Cronômetros configuráveis (por questão ou por partida) com feedback visual de urgência via transição de cores.

### 🛠️ Tecnologias e Ferramentas

**Frontend:**
- React.js + TypeScript
- Tailwind CSS (Estilização)
- Lucide React (Ícones)
- Axios (Consumo de API)
- DND Kit (Drag and Drop para ordenação)

**Backend:**
- Node.js + Express
- Prisma ORM (Modelagem e Query)
- PostgreSQL (Banco de Dados)
- JWT (Autenticação e Segurança)
- Bcrypt (Criptografia de senhas)
- Google Generative AI SDK

📖 Como Executar
Instale as dependências: npm install (em ambas as pastas).

Configure o .env do servidor com sua DATABASE_URL e GEMINI_API_KEY.

Rode as migrações: npx prisma generate e npx prisma migrate dev.

Inicie o projeto: npm run dev.

🗄️ Estrutura do Banco de Dados
O projeto utiliza PostgreSQL com o ORM Prisma. A estrutura foi desenhada para suportar exclusão lógica (deletedAt), múltiplos perfis de acesso (RBAC) e um histórico detalhado de partidas.

erDiagram
    Usuario ||--o{ Partida : "realiza"
    Pergunta ||--o{ Pergunta_Resposta : "possui"
    Resposta ||--o{ Pergunta_Resposta : "pertence a"
    Partida ||--o{ Rodada_Partida : "contém"
    Pergunta ||--o{ Rodada_Partida : "registrada em"

    Usuario {
        string id PK
        string nome
        string email
        string role
        boolean ativo
        datetime deletedAt
    }

    Pergunta {
        string id PK
        string nome
        int ordem
        datetime deletedAt
    }

    Resposta {
        string id PK
        string nome
        datetime deletedAt
    }

    Pergunta_Resposta {
        string id PK
        string id_pergunta FK
        string id_resposta FK
        boolean correta
        int ordem
    }

    Partida {
        string id PK
        string id_usuario FK
        datetime data_hora
    }

    Rodada_Partida {
        string id PK
        string id_partida FK
        string id_pergunta FK
        string id_resposta_correta
        string id_resposta_escolhida
        boolean acertou
    }