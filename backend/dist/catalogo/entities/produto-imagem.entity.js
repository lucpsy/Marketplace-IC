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
exports.ProdutoImagem = void 0;
const typeorm_1 = require("typeorm");
const produto_entity_1 = require("./produto.entity");
let ProdutoImagem = class ProdutoImagem {
};
exports.ProdutoImagem = ProdutoImagem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_imagem', type: 'bigint' }),
    __metadata("design:type", String)
], ProdutoImagem.prototype, "idImagem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => produto_entity_1.Produto, produto => produto.imagens, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'id_produto' }),
    __metadata("design:type", produto_entity_1.Produto)
], ProdutoImagem.prototype, "produto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_imagem', type: 'text', nullable: false }),
    __metadata("design:type", String)
], ProdutoImagem.prototype, "urlImagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'texto_alternativo', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProdutoImagem.prototype, "textoAlternativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false, default: 0 }),
    __metadata("design:type", Number)
], ProdutoImagem.prototype, "ordem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imagem_principal', type: 'boolean', nullable: false, default: false }),
    __metadata("design:type", Boolean)
], ProdutoImagem.prototype, "imagemPrincipal", void 0);
exports.ProdutoImagem = ProdutoImagem = __decorate([
    (0, typeorm_1.Entity)({ name: 'produto_imagem' })
], ProdutoImagem);
//# sourceMappingURL=produto-imagem.entity.js.map