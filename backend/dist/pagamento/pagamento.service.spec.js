"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pagamento_service_1 = require("./pagamento.service");
describe('PagamentoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [pagamento_service_1.PagamentoService],
        }).compile();
        service = module.get(pagamento_service_1.PagamentoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=pagamento.service.spec.js.map