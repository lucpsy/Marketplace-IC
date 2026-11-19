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
exports.PedidoController = void 0;
const common_1 = require("@nestjs/common");
const pedido_service_1 = require("./pedido.service");
const create_pedido_dto_1 = require("./dto/create-pedido.dto");
const update_status_pedido_dto_1 = require("./dto/update-status-pedido.dto");
const role_decorator_1 = require("../auth/decorators/role.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let PedidoController = class PedidoController {
    constructor(pedidoService) {
        this.pedidoService = pedidoService;
    }
    getUserId(req) {
        return req.user.id ?? req.user.sub;
    }
    listarStatus() {
        return this.pedidoService.listarStatus();
    }
    listarTransicoesPermitidas(idStatus) {
        return this.pedidoService.listarTransicoesPermitidas(idStatus);
    }
    criarDoCarrinho(req, dto) {
        return this.pedidoService.criarDoCarrinho(this.getUserId(req), dto);
    }
    findMeusPedidos(req) {
        return this.pedidoService.findMeusPedidos(this.getUserId(req));
    }
    findAll(statusId, usuarioId) {
        return this.pedidoService.findAll({ statusId, usuarioId });
    }
    findOne(req, id) {
        const isAdmin = req.user?.role === 'admin';
        return this.pedidoService.findOne(id, this.getUserId(req), isAdmin);
    }
    atualizarStatus(req, id, dto) {
        return this.pedidoService.atualizarStatus(id, dto, this.getUserId(req));
    }
};
exports.PedidoController = PedidoController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "listarStatus", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Get)('status/:idStatus/transicoes'),
    __param(0, (0, common_1.Param)('idStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "listarTransicoesPermitidas", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_pedido_dto_1.CreatePedidoDto]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "criarDoCarrinho", null);
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "findMeusPedidos", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('statusId')),
    __param(1, (0, common_1.Query)('usuarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "findOne", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_status_pedido_dto_1.UpdateStatusPedidoDto]),
    __metadata("design:returntype", void 0)
], PedidoController.prototype, "atualizarStatus", null);
exports.PedidoController = PedidoController = __decorate([
    (0, common_1.Controller)('pedido'),
    __metadata("design:paramtypes", [pedido_service_1.PedidoService])
], PedidoController);
//# sourceMappingURL=pedido.controller.js.map