"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePagamentoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_pagamento_dto_1 = require("./create-pagamento.dto");
class UpdatePagamentoDto extends (0, swagger_1.PartialType)(create_pagamento_dto_1.CreatePagamentoDto) {
}
exports.UpdatePagamentoDto = UpdatePagamentoDto;
//# sourceMappingURL=update-pagamento.dto.js.map