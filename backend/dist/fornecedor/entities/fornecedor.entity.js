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
exports.Fornecedor = void 0;
const produto_entity_1 = require("../../catalogo/entities/produto.entity");
const typeorm_1 = require("typeorm");
let Fornecedor = class Fornecedor {
};
exports.Fornecedor = Fornecedor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { type: 'bigint', name: 'id_fornecedor', }),
    __metadata("design:type", String)
], Fornecedor.prototype, "idFornecedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_razao_social', type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Fornecedor.prototype, "nomeRazaoSocial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_fantasia', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Fornecedor.prototype, "nomeFantasia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Fornecedor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], Fornecedor.prototype, "telefone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: false, default: 'pendente' }),
    __metadata("design:type", String)
], Fornecedor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dados_pagamento', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Fornecedor.prototype, "dadosPagamento", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'data_cadastro', nullable: false, default: () => 'now()' }),
    __metadata("design:type", Date)
], Fornecedor.prototype, "dataCadastro", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => produto_entity_1.Produto, produto => produto.fornecedor),
    __metadata("design:type", Array)
], Fornecedor.prototype, "produtos", void 0);
exports.Fornecedor = Fornecedor = __decorate([
    (0, typeorm_1.Entity)({ name: 'fornecedor' })
], Fornecedor);
//# sourceMappingURL=fornecedor.entity.js.map