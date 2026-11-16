"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const usuario_service_1 = require("./usuario.service");
describe('UsuarioService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [usuario_service_1.UsuarioService],
        }).compile();
        service = module.get(usuario_service_1.UsuarioService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=usuario.service.spec.js.map