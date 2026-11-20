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
exports.PromocaoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const promo_service_1 = require("./promo.service");
const create_promocao_dto_1 = require("./dto/create-promocao.dto");
const update_promocao_dto_1 = require("./dto/update-promocao.dto");
const update_status_promocao_dto_1 = require("./dto/update-status-promocao.dto");
const vincular_produtos_promocao_dto_1 = require("./dto/vincular-produtos-promocao.dto");
const validar_cupom_dto_1 = require("./dto/validar-cupom.dto");
const simular_desconto_dto_1 = require("./dto/simular-desconto.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const role_decorator_1 = require("../auth/decorators/role.decorator");
let PromocaoController = class PromocaoController {
    constructor(promocaoService, jwtService) {
        this.promocaoService = promocaoService;
        this.jwtService = jwtService;
    }
    isAdminRequest(req) {
        if (req?.user?.role === 'admin') {
            return true;
        }
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = this.jwtService.verify(token, {
                    secret: process.env.JWT_SECRET,
                });
                return payload?.role === 'admin';
            }
            catch {
                return false;
            }
        }
        return false;
    }
    findAtivas() {
        return this.promocaoService.findAtivas();
    }
    findCuponsAtivos() {
        return this.promocaoService.findCuponsAtivos();
    }
    validarCupom(dto) {
        return this.promocaoService.validarCupom(dto);
    }
    simularDesconto(dto) {
        return this.promocaoService.simularDesconto(dto);
    }
    findAll(req, status, tipoDesconto, busca, apenasAtivas, somenteCupons) {
        const isAdmin = this.isAdminRequest(req);
        const filtrarApenasAtivas = isAdmin
            ? apenasAtivas === 'true'
            : true;
        return this.promocaoService.findAll({
            status: isAdmin ? status : undefined,
            tipoDesconto,
            busca,
            apenasAtivas: filtrarApenasAtivas,
            somenteCupons: somenteCupons === 'true',
        });
    }
    findOne(req, id) {
        const isAdmin = this.isAdminRequest(req);
        return this.promocaoService.findOne(id, !isAdmin);
    }
    create(dto) {
        return this.promocaoService.create(dto);
    }
    update(id, dto) {
        return this.promocaoService.update(id, dto);
    }
    updateStatus(id, dto) {
        return this.promocaoService.updateStatus(id, dto);
    }
    vincularProdutos(id, dto) {
        return this.promocaoService.vincularProdutos(id, dto);
    }
    desvincularProduto(id, idProduto) {
        return this.promocaoService.desvincularProduto(id, idProduto);
    }
    remove(id) {
        return this.promocaoService.remove(id);
    }
};
exports.PromocaoController = PromocaoController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('ativas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "findAtivas", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('cupons/ativos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "findCuponsAtivos", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('cupons/validar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validar_cupom_dto_1.ValidarCupomDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "validarCupom", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('calcular'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [simular_desconto_dto_1.SimularDescontoDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "simularDesconto", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('tipoDesconto')),
    __param(3, (0, common_1.Query)('busca')),
    __param(4, (0, common_1.Query)('apenasAtivas')),
    __param(5, (0, common_1.Query)('somenteCupons')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "findOne", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promocao_dto_1.CreatePromocaoDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "create", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_promocao_dto_1.UpdatePromocaoDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "update", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_promocao_dto_1.UpdateStatusPromocaoDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "updateStatus", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Post)(':id/produtos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vincular_produtos_promocao_dto_1.VincularProdutosPromocaoDto]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "vincularProdutos", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Delete)(':id/produtos/:idProduto'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('idProduto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "desvincularProduto", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromocaoController.prototype, "remove", null);
exports.PromocaoController = PromocaoController = __decorate([
    (0, common_1.Controller)('promocao'),
    __metadata("design:paramtypes", [promo_service_1.PromocaoService,
        jwt_1.JwtService])
], PromocaoController);
//# sourceMappingURL=promo.controller.js.map