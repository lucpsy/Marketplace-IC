"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const notificacao_controller_1 = require("./notificacao.controller");
const notificacao_service_1 = require("./notificacao.service");
describe('NotificacaoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [notificacao_controller_1.NotificacaoController],
            providers: [notificacao_service_1.NotificacaoService],
        }).compile();
        controller = module.get(notificacao_controller_1.NotificacaoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=notificacao.controller.spec.js.map