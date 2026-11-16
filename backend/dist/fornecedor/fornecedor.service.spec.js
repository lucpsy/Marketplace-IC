"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const fornecedor_service_1 = require("./fornecedor.service");
describe('FornecedorService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [fornecedor_service_1.FornecedorService],
        }).compile();
        service = module.get(fornecedor_service_1.FornecedorService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=fornecedor.service.spec.js.map