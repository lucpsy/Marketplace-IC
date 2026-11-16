"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auditoria_controller_1 = require("./auditoria.controller");
const auditoria_service_1 = require("./auditoria.service");
describe('AuditoriaController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auditoria_controller_1.AuditoriaController],
            providers: [auditoria_service_1.AuditoriaService],
        }).compile();
        controller = module.get(auditoria_controller_1.AuditoriaController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=auditoria.controller.spec.js.map