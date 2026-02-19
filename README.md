# 🧠 Quiz Master AI - Plataforma de Aprendizado Evolutivo

Este projeto é uma aplicação de Quiz full-stack desenvolvida com foco em Arquitetura Limpa, Persistência de Dados Auditável e Inteligência Artificial. A stack **PERN** (PostgreSQL, Express, React, Node) foi escolhida pela robustez e escalabilidade.

---

## 🏛️ Arquitetura e Estrutura

O projeto adota uma **Arquitetura Desacoplada (Client-Server)**, separando totalmente o Frontend do Backend.

- **Por que separar?** Isso permite que o Backend funcione como uma API independente, podendo servir futuramente um aplicativo mobile ou outros serviços sem alterar a lógica de negócio.
- **Backend (Node/Express):** Segue o padrão de **Camadas**, onde as rotas chamam controladores que gerenciam a lógica através do Prisma.
- **Frontend (React):** Organizado por componentes reutilizáveis e Context API para gestão de estado global (autenticação).

---

## 🛠️ Tecnologias e Ferramentas

### **Frontend**
- **React.js + TypeScript**: Interface reativa e tipagem estática para evitar erros em tempo de execução.
- **Tailwind CSS**: Estilização moderna e utilitária com foco em performance.
- **Lucide React**: Biblioteca de ícones vetoriais de alta qualidade.
- **Axios**: Cliente HTTP para comunicação com a API e interceptação de tokens.
- **DND Kit**: Implementação de Drag and Drop para ordenação dinâmica de perguntas.

### **Backend**
- **Node.js + Express**: Ambiente de execução e framework minimalista para APIs.
- **Prisma ORM**: Modelagem de dados e manipulação do banco com segurança de tipos.
- **PostgreSQL**: Banco de dados relacional para persistência de dados complexos.
- **JWT (JSON Web Token)**: Autenticação stateless segura.
- **Bcrypt**: Criptografia avançada para proteção de credenciais de usuários.
- **Google Generative AI SDK**: Integração com a inteligência artificial Gemini para auxílio na criação de conteúdos.

---

## 🚀 Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/antonio-fillagranna/quiz-master.git](https://github.com/antonio-fillagranna/quiz-master.git)
   ```
   
2. **Configuração de Ambiente:**
   - No diretório `/server`, crie um arquivo `.env` com:
     ```env
     DATABASE_URL="sua_url_postgresql"
     JWT_SECRET="sua_chave_secreta"
     GEMINI_API_KEY="sua_chave_google_ai"
     ```

3. **Execução do Servidor:**
   ```bash
   cd server
   npm install
   npx prisma migrate dev
   npx tsx --watch src/server.ts
   ```
   
4. **Execução do Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🗄️ Estrutura do Banco de Dados

Abaixo está a representação do modelo relacional. Utilizei exclusão lógica (Soft Delete) para manter a integridade dos históricos de partidas e rankings.

   ```bash
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
   ```

---
Desenvolvido com ☕, ❤️ e TypeScript por [Antônio Filagranna](https://github.com/antonio-fillagranna).
