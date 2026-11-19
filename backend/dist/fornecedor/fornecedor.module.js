"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fornecedor_service_1 = require("./fornecedor.service");
const fornecedor_controller_1 = require("./fornecedor.controller");
const fornecedor_entity_1 = require("./entities/fornecedor.entity");
let FornecedorModule = class FornecedorModule {
};
exports.FornecedorModule = FornecedorModule;
exports.FornecedorModule = FornecedorModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fornecedor_entity_1.Fornecedor])],
        controllers: [fornecedor_controller_1.FornecedorController],
        providers: [fornecedor_service_1.FornecedorService],
        exports: [fornecedor_service_1.FornecedorService],
    })
], FornecedorModule);
//# sourceMappingURL=fornecedor.module.js.map