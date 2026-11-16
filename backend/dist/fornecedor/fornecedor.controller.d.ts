import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
export declare class FornecedorController {
    private readonly fornecedorService;
    constructor(fornecedorService: FornecedorService);
    create(createFornecedorDto: CreateFornecedorDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateFornecedorDto: UpdateFornecedorDto): string;
    remove(id: string): string;
}
