import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
export declare class FornecedorService {
    create(createFornecedorDto: CreateFornecedorDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateFornecedorDto: UpdateFornecedorDto): string;
    remove(id: number): string;
}
