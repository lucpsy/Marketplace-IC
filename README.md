#  Projeto Full-Stack — Programação 3

Projeto full-stack desenvolvido como parte da disciplina **Programação 3**, utilizando uma arquitetura composta por frontend, backend e banco de dados, executados em containers Docker.

##  Como executar

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado.
- Docker Compose disponível.

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
