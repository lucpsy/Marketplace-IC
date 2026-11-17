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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const usuario_service_1 = require("../usuario/usuario.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(usuarioService, jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }
    async create(dto) {
        const senha_hash = await bcrypt.hash(dto.senha, 10);
        await this.usuarioService.createUser({ nome: dto.nome, email: dto.email, senhaHash: senha_hash, telefone: dto.telefone });
        return this.login({ email: dto.email, senha: dto.senha });
    }
    async login(dto) {
        const usuario = await this.usuarioService.findOneByEmailWithPassword(dto.email);
        if (!usuario)
            throw new common_1.UnauthorizedException("email ou senha invalidos");
        const senha_valida = await bcrypt.compare(dto.senha, usuario.senhaHash);
        if (!senha_valida)
            throw new common_1.UnauthorizedException("email ou senha invalidos");
        const payload = {
            sub: usuario.idUsuario,
            role: usuario.cargo,
        };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map