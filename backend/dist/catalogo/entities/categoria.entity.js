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
exports.Categoria = void 0;
const produto_entity_1 = require("./produto.entity");
const typeorm_1 = require("typeorm");
let Categoria = class Categoria {
};
exports.Categoria = Categoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', {
        name: 'id_categoria',
        type: 'bigint'
    }),
    __metadata("design:type", String)
], Categoria.prototype, "idCategoria", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categoria, categoria => categoria.subcategorias, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_categoria_pai' }),
    __metadata("design:type", Categoria)
], Categoria.prototype, "categoriaPai", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Categoria, categoria => categoria.categoriaPai),
    __metadata("design:type", Array)
], Categoria.prototype, "subcategorias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: false }),
    __metadata("design:type", String)
], Categoria.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Categoria.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: false, default: true }),
    __metadata("design:type", Boolean)
], Categoria.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => produto_entity_1.Produto, produto => produto.categorias),
    __metadata("design:type", Array)
], Categoria.prototype, "produtos", void 0);
exports.Categoria = Categoria = __decorate([
    (0, typeorm_1.Entity)({ name: 'categoria' })
], Categoria);
//# sourceMappingURL=categoria.entity.js.map