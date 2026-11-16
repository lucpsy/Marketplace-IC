# Fake API - Marketplace IC (JSON Server)

Esta pasta contém uma Fake API REST configurada com [JSON Server](https://github.com/typicode/json-server) para simular o backend NestJS durante o desenvolvimento do frontend.

## 🚀 Como Executar

No terminal, acesse a pasta `fake-api` e inicie o servidor:

```bash
cd fake-api
npm start
```

O servidor iniciará em `http://localhost:3001` com suporte a CORS e hot-reload no arquivo `db.json`.

---

## 📡 Recursos & Endpoints Disponíveis

| Recurso | Endpoint | Métodos Suportados | Descrição |
|---|---|---|---|
| **Produtos** | `/products` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Catálogo de produtos |
| **Fornecedores** | `/suppliers` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Fornecedores parceiros do IC |
| **Promoções** | `/promotions` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Campanhas e descontos |
| **Cupons** | `/coupons` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Cupons de desconto |
| **Pedidos** | `/orders` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Pedidos realizados |
| **Transações** | `/transactions` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Entradas, saídas e repasses |
| **Usuários** | `/users` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Usuários do sistema (cliente / admin) |

### Exemplos de Requisições:
- Listar todos os produtos: `GET http://localhost:3001/products`
- Filtrar produtos por fornecedor: `GET http://localhost:3001/products?supplierId=confeccoes-ic`
- Buscar produto por ID: `GET http://localhost:3001/products/camisa-diacom`
- Criar novo pedido: `POST http://localhost:3001/orders` com payload JSON no corpo.

---

## 🗺️ Mapeamento com o Diagrama ER do Banco de Dados

Futuramente, ao migrar para o backend oficial em **NestJS** com **PostgreSQL**, estes endpoints refletirão as tabelas do modelo de dados:

- `/products` ➔ Tabelas `PRODUTO`, `PRODUTO_IMAGEM`, `PRODUTO_CATEGORIA`
- `/suppliers` ➔ Tabela `FORNECEDOR`
- `/promotions` ➔ Tabelas `PROMOCAO`, `PRODUTO_PROMOCAO`
- `/orders` ➔ Tabelas `PEDIDO`, `ITEM_PEDIDO`, `HISTORICO_STATUS`, `TRANSICAO_STATUS`
- `/transactions` ➔ Tabela `PAGAMENTO`
- `/users` ➔ Tabela `USUARIO`
