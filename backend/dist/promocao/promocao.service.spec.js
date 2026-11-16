"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const promocao_service_1 = require("./promocao.service");
describe('PromocaoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [promocao_service_1.PromocaoService],
        }).compile();
        service = module.get(promocao_service_1.PromocaoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=promocao.service.spec.js.map