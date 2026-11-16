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
exports.Promocao = void 0;
const typeorm_1 = require("typeorm");
const produto_promocao_entity_1 = require("./produto_promocao.entity");
let Promocao = class Promocao {
};
exports.Promocao = Promocao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', {
        name: 'id_promocao',
        type: 'bigint'
    }),
    __metadata("design:type", String)
], Promocao.prototype, "idPromocao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Promocao.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Promocao.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_desconto', type: 'varchar', length: 30, nullable: false }),
    __metadata("design:type", String)
], Promocao.prototype, "tipoDesconto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'valor_desconto',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: false
    }),
    __metadata("design:type", String)
], Promocao.prototype, "valorDesconto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_inicio', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Promocao.prototype, "dataInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_fim', type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Promocao.prototype, "dataFim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], Promocao.prototype, "cor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        nullable: false,
        default: 'rascunho'
    }),
    __metadata("design:type", String)
], Promocao.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'data_cadastro',
        type: 'timestamp',
        nullable: false,
        default: () => 'now()'
    }),
    __metadata("design:type", Date)
], Promocao.prototype, "dataCadastro", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => produto_promocao_entity_1.ProdutoPromocao, pp => pp.promocao),
    __metadata("design:type", Array)
], Promocao.prototype, "produtosPromocao", void 0);
exports.Promocao = Promocao = __decorate([
    (0, typeorm_1.Entity)({ name: 'promocao' })
], Promocao);
//# sourceMappingURL=promocao.entity.js.map