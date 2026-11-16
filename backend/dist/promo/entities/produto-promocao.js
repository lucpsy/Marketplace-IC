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
exports.ProdutoPromocao = void 0;
const typeorm_1 = require("typeorm");
const produto_entity_1 = require("../../catalogo/entities/produto.entity");
const promocao_entity_1 = require("./promocao.entity");
let ProdutoPromocao = class ProdutoPromocao {
};
exports.ProdutoPromocao = ProdutoPromocao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', {
        name: 'id_produto_promocao',
        type: 'bigint'
    }),
    __metadata("design:type", String)
], ProdutoPromocao.prototype, "idProdutoPromocao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => promocao_entity_1.Promocao, promocao => promocao.produtosPromocao, {
        nullable: false
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_promocao' }),
    __metadata("design:type", promocao_entity_1.Promocao)
], ProdutoPromocao.prototype, "promocao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => produto_entity_1.Produto, produto => produto.promocoes, {
        nullable: false
    }),
    (0, typeorm_1.JoinColumn)({ name: 'id_produto' }),
    __metadata("design:type", produto_entity_1.Produto)
], ProdutoPromocao.prototype, "produto", void 0);
exports.ProdutoPromocao = ProdutoPromocao = __decorate([
    (0, typeorm_1.Entity)({ name: 'produto_promocao' })
], ProdutoPromocao);
//# sourceMappingURL=produto-promocao.js.map