"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FornecedorController = void 0;
const common_1 = require("@nestjs/common");
const fornecedor_service_1 = require("./fornecedor.service");
const create_fornecedor_dto_1 = require("./dto/create-fornecedor.dto");
const update_fornecedor_dto_1 = require("./dto/update-fornecedor.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const role_decorator_1 = require("../auth/decorators/role.decorator");
let FornecedorController = class FornecedorController {
    constructor(fornecedorService) {
        this.fornecedorService = fornecedorService;
    }
    create(createFornecedorDto) {
        return this.fornecedorService.create(createFornecedorDto);
    }
    findAll(status, busca) {
        return this.fornecedorService.findAll({ status, busca });
    }
    findOne(id) {
        return this.fornecedorService.findOne(id);
    }
    update(id, updateFornecedorDto) {
        return this.fornecedorService.update(id, updateFornecedorDto);
    }
    remove(id) {
        return this.fornecedorService.remove(id);
    }
};
exports.FornecedorController = FornecedorController;
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fornecedor_dto_1.CreateFornecedorDto]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('busca')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "findOne", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fornecedor_dto_1.UpdateFornecedorDto]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "update", null);
__decorate([
    (0, role_decorator_1.Admin)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FornecedorController.prototype, "remove", null);
exports.FornecedorController = FornecedorController = __decorate([
    (0, common_1.Controller)('fornecedor'),
    __metadata("design:paramtypes", [fornecedor_service_1.FornecedorService])
], FornecedorController);
//# sourceMappingURL=fornecedor.controller.js.map