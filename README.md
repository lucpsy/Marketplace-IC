#  Projeto Full-Stack — Programação 3

Projeto full-stack desenvolvido como parte da disciplina **Programação 3**, utilizando uma arquitetura composta por frontend, backend e banco de dados, executados em containers Docker.

##  Como executar

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado.
- Docker Compose disponível.

### Variáveis de Ambiente (`.env`)

Antes de subir os containers, crie o arquivo **`backend/.env`** (dentro da pasta `backend/`, na raiz do serviço NestJS). Esse arquivo não é versionado pelo Git.

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :---: | :--- | :--- |
| `JWT_SECRET` | **Sim** | — | Chave secreta usada para assinar e validar os tokens JWT de autenticação. |
| `PORT` | Não | `3000` | Porta interna do servidor NestJS dentro do container (exposta em `3001` no host). |
| `ADMIN_EMAIL` | Não | `admin@diacom.ic.ufal.br` | E-mail do administrador padrão criado automaticamente pela seed. |
| `ADMIN_PASSWORD` | Não | `admin123` | Senha do administrador padrão criado automaticamente pela seed. |
| `ADMIN_NOME` | Não | `Coordenação DIACOM` | Nome do administrador padrão criado automaticamente pela seed. |

Exemplo de **`backend/.env`**:

```env
JWT_SECRET=sua_chave_secreta_forte_aqui
PORT=3000
ADMIN_EMAIL=admin@diacom.ic.ufal.br
ADMIN_PASSWORD=admin123
ADMIN_NOME="Coordenação DIACOM"
```

> **Observação:** as variáveis do banco PostgreSQL (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`) e do frontend (`NEXT_PUBLIC_API_URL=http://localhost:3001/api`) já estão configuradas no `docker-compose.yml`. Caso rode o frontend localmente fora do Docker, crie `frontend/.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.

### Inicialização

Na raiz do projeto, execute o comando:

```bash
docker compose up
```

O Docker Compose será responsável por construir e iniciar os serviços necessários para a aplicação.

Após a inicialização, aguarde os servidores ficarem disponíveis.

##  Acessos

Com os containers em execução, a aplicação estará disponível nos seguintes endereços:

| Serviço | Endereço | Acesso via Docker |
|---|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | `Frontend:3000` |
| **Backend** | [http://localhost:3001](http://localhost:3001) | `Backend:3000` |

- **Frontend:** interface gráfica da aplicação, acessível pelo navegador.
- **Backend:** responsável pelo processamento das requisições e pela lógica da aplicação.

##  Docker

Os serviços são executados de forma isolada em containers, permitindo inicializar o ambiente de desenvolvimento com um único comando.

Para encerrar os serviços, utilize:

```bash
docker compose down
```

---

**Desenvolvido para a disciplina de Programação 3.**
