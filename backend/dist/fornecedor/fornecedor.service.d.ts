import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Fornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
export declare class FornecedorService implements OnModuleInit {
    private readonly fornecedorRepo;
    constructor(fornecedorRepo: Repository<Fornecedor>);
    onModuleInit(): Promise<void>;
    create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor>;
    findAll(filtros?: {
        status?: string;
        busca?: string;
    }): Promise<Fornecedor[]>;
    findOne(id: string): Promise<Fornecedor>;
    update(id: string, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
