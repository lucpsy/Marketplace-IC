"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const catalogo_service_1 = require("./catalogo.service");
describe('CatalogoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [catalogo_service_1.CatalogoService],
        }).compile();
        service = module.get(catalogo_service_1.CatalogoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=catalogo.service.spec.js.map