"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const carrinho_controller_1 = require("./carrinho.controller");
const carrinho_service_1 = require("./carrinho.service");
describe('CarrinhoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [carrinho_controller_1.CarrinhoController],
            providers: [carrinho_service_1.CarrinhoService],
        }).compile();
        controller = module.get(carrinho_controller_1.CarrinhoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=carrinho.controller.spec.js.map