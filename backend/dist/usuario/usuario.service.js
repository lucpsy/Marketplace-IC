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
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_entity_1 = require("./entities/usuario.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
let UsuarioService = class UsuarioService {
    constructor(repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
    }
    async createUser(createUsuarioDto) {
        if (await this.findOneByEmail(createUsuarioDto.email))
            throw new common_1.ConflictException('Este Email já está cadastrado');
        const novo_usuario = this.repositorioUsuario.create(createUsuarioDto);
        return this.repositorioUsuario.save(novo_usuario);
    }
    async removeUser(id) {
        const usuario = await this.findOneById(id);
        if (!usuario) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        else {
            await this.repositorioUsuario.update(id, { status: 'inativo' });
        }
        return { message: 'Usuário desativado com sucesso' };
    }
    async updateUser(id, dto) {
        const usuario = await this.findOneByIdWithPassword(id);
        if (!usuario) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const dados = { ...dto };
        if (dados.senha) {
            if (await bcrypt.compare(dados.senhaAntiga, usuario.senhaHash)) {
                dados['senhaHash'] = await bcrypt.hash(dados.senha, 10);
                delete dados.senha;
                delete dados.senhaAntiga;
            }
            else
                throw new common_1.UnauthorizedException('Senha antiga incorreta');
        }
        if (dados.email && await this.findOneByEmail(dados.email))
            throw new common_1.ConflictException('Este Email já está cadastrado');
        await this.repositorioUsuario.update(id, dados);
        return { message: 'Usuário atualizado com sucesso' };
    }
    async adminUpdateUser(id, dto) {
        const usuario = await this.findOneById(id);
        if (!usuario) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        const dados = { ...dto };
        if (dados.senha) {
            dados['senhaHash'] = await bcrypt.hash(dados.senha, 10);
            delete dados.senha;
        }
        if (dados.email && await this.findOneByEmail(dados.email))
            throw new common_1.ConflictException('Este Email já está cadastrado');
        await this.repositorioUsuario.update(id, dados);
        return { message: 'Usuário atualizado com sucesso' };
    }
    findOneByEmail(email) {
        return this.repositorioUsuario.findOneBy({ email: email, });
    }
    findOneById(id) {
        return this.repositorioUsuario.findOneBy({ idUsuario: id, });
    }
    async findOneByIdWithPassword(id) {
        return this.repositorioUsuario
            .createQueryBuilder('usuario')
            .addSelect('usuario.senhaHash')
            .where('usuario.idUsuario = :id', { id })
            .getOne();
    }
    async findOneByEmailWithPassword(email) {
        return this.repositorioUsuario
            .createQueryBuilder('usuario')
            .addSelect('usuario.senhaHash')
            .where('usuario.email = :email', { email })
            .getOne();
    }
    findAll() {
        return this.repositorioUsuario.find();
    }
};
exports.UsuarioService = UsuarioService;
exports.UsuarioService = UsuarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsuarioService);
//# sourceMappingURL=usuario.service.js.map