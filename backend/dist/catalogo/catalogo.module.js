"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const catalogo_service_1 = require("./catalogo.service");
const catalogo_controller_1 = require("./catalogo.controller");
const produto_entity_1 = require("./entities/produto.entity");
const categoria_entity_1 = require("./entities/categoria.entity");
const produto_imagem_entity_1 = require("./entities/produto-imagem.entity");
const fornecedor_entity_1 = require("../fornecedor/entities/fornecedor.entity");
const promo_module_1 = require("../promo/promo.module");
let CatalogoModule = class CatalogoModule {
};
exports.CatalogoModule = CatalogoModule;
exports.CatalogoModule = CatalogoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([produto_entity_1.Produto, categoria_entity_1.Categoria, produto_imagem_entity_1.ProdutoImagem, fornecedor_entity_1.Fornecedor]),
            jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET }),
            promo_module_1.PromocaoModule,
        ],
        controllers: [catalogo_controller_1.CatalogoController],
        providers: [catalogo_service_1.CatalogoService],
        exports: [catalogo_service_1.CatalogoService],
    })
], CatalogoModule);
//# sourceMappingURL=catalogo.module.js.map