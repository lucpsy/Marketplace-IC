"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pedido_controller_1 = require("./pedido.controller");
const pedido_service_1 = require("./pedido.service");
describe('PedidoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [pedido_controller_1.PedidoController],
            providers: [pedido_service_1.PedidoService],
        }).compile();
        controller = module.get(pedido_controller_1.PedidoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=pedido.controller.spec.js.map