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
exports.CreatePromocaoDto = exports.STATUS_PROMOCAO = exports.TIPOS_DESCONTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.TIPOS_DESCONTO = ['percentual', 'fixo', 'frete_gratis'];
exports.STATUS_PROMOCAO = [
    'rascunho',
    'ativa',
    'inativa',
    'encerrada',
];
class CreatePromocaoDto {
}
exports.CreatePromocaoDto = CreatePromocaoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O título da promoção é obrigatório' }),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.TIPOS_DESCONTO, {
        message: 'tipoDesconto deve ser percentual, fixo ou frete_gratis',
    }),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "tipoDesconto", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'valorDesconto deve ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'valorDesconto não pode ser negativo' }),
    __metadata("design:type", Number)
], CreatePromocaoDto.prototype, "valorDesconto", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'dataInicio deve ser uma data ISO válida' }),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "dataInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'dataFim deve ser uma data ISO válida' }),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "dataFim", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "cor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "codigo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'valorMinimo deve ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'valorMinimo não pode ser negativo' }),
    __metadata("design:type", Number)
], CreatePromocaoDto.prototype, "valorMinimo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'quantidadeMinima deve ser um número inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'quantidadeMinima deve ser no mínimo 1' }),
    __metadata("design:type", Number)
], CreatePromocaoDto.prototype, "quantidadeMinima", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.STATUS_PROMOCAO, {
        message: 'status deve ser rascunho, ativa, inativa ou encerrada',
    }),
    __metadata("design:type", String)
], CreatePromocaoDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePromocaoDto.prototype, "produtoIds", void 0);
//# sourceMappingURL=create-promocao.dto.js.map