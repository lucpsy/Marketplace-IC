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
exports.Notificacao = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuario/entities/usuario.entity");
let Notificacao = class Notificacao {
};
exports.Notificacao = Notificacao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_notificacao', type: 'bigint', }),
    __metadata("design:type", String)
], Notificacao.prototype, "idNotificacao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, usuario => usuario.notificacoes, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Notificacao.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: false, }),
    __metadata("design:type", String)
], Notificacao.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false, }),
    __metadata("design:type", String)
], Notificacao.prototype, "mensagem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, }),
    __metadata("design:type", String)
], Notificacao.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: false, default: false, }),
    __metadata("design:type", Boolean)
], Notificacao.prototype, "lida", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'data_criacao', type: 'timestamp', nullable: false, default: () => 'now()', }),
    __metadata("design:type", Date)
], Notificacao.prototype, "dataCriacao", void 0);
exports.Notificacao = Notificacao = __decorate([
    (0, typeorm_1.Entity)({ name: 'notificacao' })
], Notificacao);
//# sourceMappingURL=notificacao.entity.js.map