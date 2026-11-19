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
exports.FornecedorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fornecedor_entity_1 = require("./entities/fornecedor.entity");
const seed_fornecedores_1 = require("../database/seeds/seed-fornecedores");
let FornecedorService = class FornecedorService {
    constructor(fornecedorRepo) {
        this.fornecedorRepo = fornecedorRepo;
    }
    async onModuleInit() {
        await (0, seed_fornecedores_1.seedFornecedores)(this.fornecedorRepo);
    }
    async create(createFornecedorDto) {
        const fornecedor = this.fornecedorRepo.create({
            ...createFornecedorDto,
            status: createFornecedorDto.status ?? 'ativo',
        });
        return this.fornecedorRepo.save(fornecedor);
    }
    async findAll(filtros) {
        const qb = this.fornecedorRepo.createQueryBuilder('fornecedor');
        if (filtros?.status) {
            qb.andWhere('fornecedor.status = :status', { status: filtros.status });
        }
        if (filtros?.busca) {
            qb.andWhere('(LOWER(fornecedor.nomeRazaoSocial) LIKE LOWER(:busca) OR LOWER(fornecedor.nomeFantasia) LIKE LOWER(:busca))', { busca: `%${filtros.busca}%` });
        }
        qb.orderBy('fornecedor.nomeFantasia', 'ASC');
        return qb.getMany();
    }
    async findOne(id) {
        const fornecedor = await this.fornecedorRepo.findOne({
            where: { idFornecedor: id },
            relations: ['produtos'],
        });
        if (!fornecedor) {
            throw new common_1.NotFoundException(`Fornecedor #${id} não encontrado`);
        }
        return fornecedor;
    }
    async update(id, updateFornecedorDto) {
        const fornecedor = await this.findOne(id);
        Object.assign(fornecedor, updateFornecedorDto);
        return this.fornecedorRepo.save(fornecedor);
    }
    async remove(id) {
        const fornecedor = await this.findOne(id);
        fornecedor.status = 'inativo';
        await this.fornecedorRepo.save(fornecedor);
        return { message: `Fornecedor #${id} desativado com sucesso` };
    }
};
exports.FornecedorService = FornecedorService;
exports.FornecedorService = FornecedorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fornecedor_entity_1.Fornecedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FornecedorService);
//# sourceMappingURL=fornecedor.service.js.map