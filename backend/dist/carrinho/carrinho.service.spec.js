"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const carrinho_service_1 = require("./carrinho.service");
describe('CarrinhoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [carrinho_service_1.CarrinhoService],
        }).compile();
        service = module.get(carrinho_service_1.CarrinhoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=carrinho.service.spec.js.map