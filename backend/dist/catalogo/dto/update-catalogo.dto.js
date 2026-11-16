"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCatalogoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_catalogo_dto_1 = require("./create-catalogo.dto");
class UpdateCatalogoDto extends (0, swagger_1.PartialType)(create_catalogo_dto_1.CreateCatalogoDto) {
}
exports.UpdateCatalogoDto = UpdateCatalogoDto;
//# sourceMappingURL=update-catalogo.dto.js.map