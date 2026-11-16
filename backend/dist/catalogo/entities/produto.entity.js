"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
const fornecedor_entity_1 = require("../../fornecedor/entities/fornecedor.entity");
const produto_imagem_entity_1 = require("./produto-imagem.entity");
const categoria_entity_1 = require("./categoria.entity");
const produto_promocao_entity_1 = require("../../promo/entities/produto_promocao.entity");
const carrinho_item_entity_1 = require("../../carrinho/entities/carrinho-item.entity");
const item_pedido_entity_1 = require("../../pedido/entities/item_pedido.entity");
const typeorm_1 = require("typeorm");
let Produto = class Produto {
};
exports.Produto = Produto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("identity", { name: "id_produto", type: "bigint" }),
    __metadata("design:type", String)
], Produto.prototype, "idProduto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fornecedor_entity_1.Fornecedor, fornecedor => fornecedor.produtos, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "id_fornecedor" }),
    __metadata("design:type", fornecedor_entity_1.Fornecedor)
], Produto.prototype, "fornecedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Produto.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Produto.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Produto.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: true }),
    __metadata("design:type", String)
], Produto.prototype, "selo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Produto.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preco_custo', type: 'decimal', precision: 12, scale: 2, nullable: false }),
    __metadata("design:type", String)
], Produto.prototype, "precoCusto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preco_venda', type: 'decimal', precision: 12, scale: 2, nullable: false }),
    __metadata("design:type", String)
], Produto.prototype, "precoVenda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Produto.prototype, "estoque", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: false, default: 'ativo' }),
    __metadata("design:type", String)
], Produto.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'data_cadastro', nullable: false, default: () => 'now()' }),
    __metadata("design:type", Date)
], Produto.prototype, "dataCadastro", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', name: 'data_atualizacao', nullable: true }),
    __metadata("design:type", Date)
], Produto.prototype, "dataAtualizacao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => produto_imagem_entity_1.ProdutoImagem, produtoimagem => produtoimagem.produto),
    __metadata("design:type", Array)
], Produto.prototype, "imagens", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => categoria_entity_1.Categoria, categoria => categoria.produtos),
    (0, typeorm_1.JoinTable)({ name: 'produto_categoria',
        joinColumn: {
            name: 'id_produto',
            referencedColumnName: 'idProduto'
        },
        inverseJoinColumn: {
            name: 'id_categoria',
            referencedColumnName: 'idCategoria'
        }
    }),
    __metadata("design:type", Array)
], Produto.prototype, "categorias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => produto_promocao_entity_1.ProdutoPromocao, pp => pp.produto),
    __metadata("design:type", Array)
], Produto.prototype, "promocoes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => carrinho_item_entity_1.CarrinhoItem, item => item.produto),
    __metadata("design:type", Array)
], Produto.prototype, "itensCarrinho", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_pedido_entity_1.ItemPedido, item => item.produto),
    __metadata("design:type", Array)
], Produto.prototype, "itensPedido", void 0);
exports.Produto = Produto = __decorate([
    (0, typeorm_1.Entity)({ name: "produto" })
], Produto);
//# sourceMappingURL=produto.entity.js.map