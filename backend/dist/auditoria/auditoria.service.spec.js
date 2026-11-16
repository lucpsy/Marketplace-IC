"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auditoria_service_1 = require("./auditoria.service");
describe('AuditoriaService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auditoria_service_1.AuditoriaService],
        }).compile();
        service = module.get(auditoria_service_1.AuditoriaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=auditoria.service.spec.js.map