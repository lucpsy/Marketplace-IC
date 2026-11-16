"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pedido_service_1 = require("./pedido.service");
describe('PedidoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [pedido_service_1.PedidoService],
        }).compile();
        service = module.get(pedido_service_1.PedidoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=pedido.service.spec.js.map