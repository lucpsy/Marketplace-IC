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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const catalogo_service_1 = require("./catalogo.service");
const create_produto_dto_1 = require("./dto/create-produto.dto");
const update_produto_dto_1 = require("./dto/update-produto.dto");
const create_categoria_dto_1 = require("./dto/create-categoria.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const role_decorator_1 = require("../auth/decorators/role.decorator");
let CatalogoController = class CatalogoController {
    constructor(catalogoService, jwtService) {
        this.catalogoService = catalogoService;
        this.jwtService = jwtService;
    }
    findAllProdutos(req, categoriaId, fornecedorId, busca, apenasAtivos) {
        let isAdmin = req?.user?.role === 'admin';
        if (!isAdmin) {
            const authHeader = req.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const payload = this.jwtService.verify(token, {
                        secret: process.env.JWT_SECRET,
                    });
                    if (payload?.role === 'admin') {
                        isAdmin = true;
                    }
                }
                catch {
                }
            }
        }
        const filtrarApenasAtivos = isAdmin && apenasAtivos !== undefined ? apenasAtivos === 'true' : true;
        return this.catalogoService.findAllProdutos({
            categoriaId,
            fornecedorId,
            busca,
            apenasAtivos: filtrarApenasAtivos,
        });
    }
    findOneProduto(id) {
        return this.catalogoService.findOneProduto(id);
    }
    createProduto(dto) {
        return this.catalogoService.createProduto(dto);
    }
    updateProduto(id, dto) {
        return this.catalogoService.updateProduto(id, dto);
    }
    removeProduto(id) {
        return this.catalogoService.removeProduto(id);
    }
    findAllCategorias() {
        return this.catalogoService.findAllCategorias();
    }
    findOneCategoria(id) {
        return this.catalogoService.findOneCategoria(id);
    }
    createCategoria(dto) {
        return this.catalogoService.createCategoria(dto);
    }
    updateCategoria(id, dto) {
        return this.catalogoService.updateCategoria(id, dto);
    }
    removeCategoria(id) {
        return this.catalogoService.removeCategoria(id);
    }
};
exports.CatalogoController = CatalogoController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('produtos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __param(2, (0, common_1.Query)('fornecedorId')),
    __param(3, (0, common_1.Query)('busca')),
    __param(4, (0, common_1.Query)('apenasAtivos')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findAllProdutos", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('produtos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findOneProduto", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Post)('produtos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_produto_dto_1.CreateProdutoDto]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "createProduto", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)('produtos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_produto_dto_1.UpdateProdutoDto]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateProduto", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Delete)('produtos/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "removeProduto", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('categorias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findAllCategorias", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('categorias/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findOneCategoria", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Post)('categorias'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_categoria_dto_1.CreateCategoriaDto]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "createCategoria", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)('categorias/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_categoria_dto_1.UpdateCategoriaDto]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateCategoria", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Delete)('categorias/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "removeCategoria", null);
exports.CatalogoController = CatalogoController = __decorate([
    (0, common_1.Controller)('catalogo'),
    __metadata("design:paramtypes", [catalogo_service_1.CatalogoService,
        jwt_1.JwtService])
], CatalogoController);
//# sourceMappingURL=catalogo.controller.js.map