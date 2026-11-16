"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoService = void 0;
const common_1 = require("@nestjs/common");
let PedidoService = class PedidoService {
    create(createPedidoDto) {
        return 'This action adds a new pedido';
    }
    findAll() {
        return `This action returns all pedido`;
    }
    findOne(id) {
        return `This action returns a #${id} pedido`;
    }
    update(id, updatePedidoDto) {
        return `This action updates a #${id} pedido`;
    }
    remove(id) {
        return `This action removes a #${id} pedido`;
    }
};
exports.PedidoService = PedidoService;
exports.PedidoService = PedidoService = __decorate([
    (0, common_1.Injectable)()
], PedidoService);
//# sourceMappingURL=pedido.service.js.map