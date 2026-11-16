"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const notificacao_service_1 = require("./notificacao.service");
describe('NotificacaoService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [notificacao_service_1.NotificacaoService],
        }).compile();
        service = module.get(notificacao_service_1.NotificacaoService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=notificacao.service.spec.js.map