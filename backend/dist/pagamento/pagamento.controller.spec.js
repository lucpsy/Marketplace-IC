"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pagamento_controller_1 = require("./pagamento.controller");
const pagamento_service_1 = require("./pagamento.service");
describe('PagamentoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [pagamento_controller_1.PagamentoController],
            providers: [pagamento_service_1.PagamentoService],
        }).compile();
        controller = module.get(pagamento_controller_1.PagamentoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=pagamento.controller.spec.js.map