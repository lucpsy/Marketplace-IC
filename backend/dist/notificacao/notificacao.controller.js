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
exports.NotificacaoController = void 0;
const common_1 = require("@nestjs/common");
const notificacao_service_1 = require("./notificacao.service");
const create_notificacao_dto_1 = require("./dto/create-notificacao.dto");
const update_notificacao_dto_1 = require("./dto/update-notificacao.dto");
let NotificacaoController = class NotificacaoController {
    constructor(notificacaoService) {
        this.notificacaoService = notificacaoService;
    }
    create(createNotificacaoDto) {
        return this.notificacaoService.create(createNotificacaoDto);
    }
    findAll() {
        return this.notificacaoService.findAll();
    }
    findOne(id) {
        return this.notificacaoService.findOne(+id);
    }
    update(id, updateNotificacaoDto) {
        return this.notificacaoService.update(+id, updateNotificacaoDto);
    }
    remove(id) {
        return this.notificacaoService.remove(+id);
    }
};
exports.NotificacaoController = NotificacaoController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notificacao_dto_1.CreateNotificacaoDto]),
    __metadata("design:returntype", void 0)
], NotificacaoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificacaoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificacaoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_notificacao_dto_1.UpdateNotificacaoDto]),
    __metadata("design:returntype", void 0)
], NotificacaoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificacaoController.prototype, "remove", null);
exports.NotificacaoController = NotificacaoController = __decorate([
    (0, common_1.Controller)('notificacao'),
    __metadata("design:paramtypes", [notificacao_service_1.NotificacaoService])
], NotificacaoController);
//# sourceMappingURL=notificacao.controller.js.map