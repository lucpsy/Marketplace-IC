"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const promocao_controller_1 = require("./promocao.controller");
const promocao_service_1 = require("./promocao.service");
describe('PromocaoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [promocao_controller_1.PromocaoController],
            providers: [promocao_service_1.PromocaoService],
        }).compile();
        controller = module.get(promocao_controller_1.PromocaoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=promocao.controller.spec.js.map