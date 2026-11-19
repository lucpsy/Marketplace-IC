import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { seedFornecedores } from '../database/seeds/seed-fornecedores';

@Injectable()
export class FornecedorService implements OnModuleInit {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepo: Repository<Fornecedor>,
  ) {}

  async onModuleInit() {
    await seedFornecedores(this.fornecedorRepo);
  }

  async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = this.fornecedorRepo.create({
      ...createFornecedorDto,
      status: createFornecedorDto.status ?? 'ativo',
    });
    return this.fornecedorRepo.save(fornecedor);
  }

  async findAll(filtros?: { status?: string; busca?: string }): Promise<Fornecedor[]> {
    const qb = this.fornecedorRepo.createQueryBuilder('fornecedor');

    if (filtros?.status) {
      qb.andWhere('fornecedor.status = :status', { status: filtros.status });
    }

    if (filtros?.busca) {
      qb.andWhere(
        '(LOWER(fornecedor.nomeRazaoSocial) LIKE LOWER(:busca) OR LOWER(fornecedor.nomeFantasia) LIKE LOWER(:busca))',
        { busca: `%${filtros.busca}%` },
      );
    }

    qb.orderBy('fornecedor.nomeFantasia', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({
      where: { idFornecedor: id },
      relations: ['produtos'],
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor #${id} não encontrado`);
    }

    return fornecedor;
  }

  async update(id: string, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    Object.assign(fornecedor, updateFornecedorDto);
    return this.fornecedorRepo.save(fornecedor);
  }

  async remove(id: string): Promise<{ message: string }> {
    const fornecedor = await this.findOne(id);
    fornecedor.status = 'inativo';
    await this.fornecedorRepo.save(fornecedor);
    return { message: `Fornecedor #${id} desativado com sucesso` };
  }
}
