"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const usuario_controller_1 = require("./usuario.controller");
const usuario_service_1 = require("./usuario.service");
describe('UsuarioController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [usuario_controller_1.UsuarioController],
            providers: [usuario_service_1.UsuarioService],
        }).compile();
        controller = module.get(usuario_controller_1.UsuarioController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=usuario.controller.spec.js.map