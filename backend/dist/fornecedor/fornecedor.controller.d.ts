import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
export declare class FornecedorController {
    private readonly fornecedorService;
    constructor(fornecedorService: FornecedorService);
    create(createFornecedorDto: CreateFornecedorDto): Promise<import("./entities/fornecedor.entity").Fornecedor>;
    findAll(status?: string, busca?: string): Promise<import("./entities/fornecedor.entity").Fornecedor[]>;
    findOne(id: string): Promise<import("./entities/fornecedor.entity").Fornecedor>;
    update(id: string, updateFornecedorDto: UpdateFornecedorDto): Promise<import("./entities/fornecedor.entity").Fornecedor>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
