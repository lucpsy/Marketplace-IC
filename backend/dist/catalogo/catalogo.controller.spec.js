"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const catalogo_controller_1 = require("./catalogo.controller");
const catalogo_service_1 = require("./catalogo.service");
describe('CatalogoController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [catalogo_controller_1.CatalogoController],
            providers: [catalogo_service_1.CatalogoService],
        }).compile();
        controller = module.get(catalogo_controller_1.CatalogoController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=catalogo.controller.spec.js.map