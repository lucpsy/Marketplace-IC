"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const fornecedor_controller_1 = require("./fornecedor.controller");
const fornecedor_service_1 = require("./fornecedor.service");
describe('FornecedorController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [fornecedor_controller_1.FornecedorController],
            providers: [fornecedor_service_1.FornecedorService],
        }).compile();
        controller = module.get(fornecedor_controller_1.FornecedorController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=fornecedor.controller.spec.js.map