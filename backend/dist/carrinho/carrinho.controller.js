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
exports.CarrinhoController = void 0;
const common_1 = require("@nestjs/common");
const carrinho_service_1 = require("./carrinho.service");
const add_item_carrinho_dto_1 = require("./dto/add-item-carrinho.dto");
const update_item_carrinho_dto_1 = require("./dto/update-item-carrinho.dto");
let CarrinhoController = class CarrinhoController {
    constructor(carrinhoService) {
        this.carrinhoService = carrinhoService;
    }
    getUserId(req) {
        return req.user.id ?? req.user.sub;
    }
    obterCarrinho(req) {
        return this.carrinhoService.obterCarrinho(this.getUserId(req));
    }
    adicionarItem(req, dto) {
        return this.carrinhoService.adicionarItem(this.getUserId(req), dto);
    }
    atualizarQuantidade(req, idItem, dto) {
        return this.carrinhoService.atualizarQuantidade(this.getUserId(req), idItem, dto);
    }
    removerItem(req, idItem) {
        return this.carrinhoService.removerItem(this.getUserId(req), idItem);
    }
    limparCarrinho(req) {
        return this.carrinhoService.limparCarrinho(this.getUserId(req));
    }
};
exports.CarrinhoController = CarrinhoController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CarrinhoController.prototype, "obterCarrinho", null);
__decorate([
    (0, common_1.Post)('itens'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_item_carrinho_dto_1.AddItemCarrinhoDto]),
    __metadata("design:returntype", void 0)
], CarrinhoController.prototype, "adicionarItem", null);
__decorate([
    (0, common_1.Patch)('itens/:idItem'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('idItem')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_item_carrinho_dto_1.UpdateItemCarrinhoDto]),
    __metadata("design:returntype", void 0)
], CarrinhoController.prototype, "atualizarQuantidade", null);
__decorate([
    (0, common_1.Delete)('itens/:idItem'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('idItem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CarrinhoController.prototype, "removerItem", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CarrinhoController.prototype, "limparCarrinho", null);
exports.CarrinhoController = CarrinhoController = __decorate([
    (0, common_1.Controller)('carrinho'),
    __metadata("design:paramtypes", [carrinho_service_1.CarrinhoService])
], CarrinhoController);
//# sourceMappingURL=carrinho.controller.js.map