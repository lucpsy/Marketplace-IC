"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagamentoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pagamento_service_1 = require("./pagamento.service");
const pagamento_controller_1 = require("./pagamento.controller");
const pagamento_entity_1 = require("./entities/pagamento.entity");
let PagamentoModule = class PagamentoModule {
};
exports.PagamentoModule = PagamentoModule;
exports.PagamentoModule = PagamentoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pagamento_entity_1.Pagamento])],
        controllers: [pagamento_controller_1.PagamentoController],
        providers: [pagamento_service_1.PagamentoService],
    })
], PagamentoModule);
//# sourceMappingURL=pagamento.module.js.map