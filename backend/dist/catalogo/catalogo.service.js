"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoService = void 0;
const common_1 = require("@nestjs/common");
let CatalogoService = class CatalogoService {
    create(createCatalogoDto) {
        return 'This action adds a new catalogo';
    }
    findAll() {
        return `This action returns all catalogo`;
    }
    findOne(id) {
        return `This action returns a #${id} catalogo`;
    }
    update(id, updateCatalogoDto) {
        return `This action updates a #${id} catalogo`;
    }
    remove(id) {
        return `This action removes a #${id} catalogo`;
    }
};
exports.CatalogoService = CatalogoService;
exports.CatalogoService = CatalogoService = __decorate([
    (0, common_1.Injectable)()
], CatalogoService);
//# sourceMappingURL=catalogo.service.js.map