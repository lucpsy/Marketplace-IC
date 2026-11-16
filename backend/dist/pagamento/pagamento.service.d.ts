import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
export declare class PagamentoService {
    create(createPagamentoDto: CreatePagamentoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePagamentoDto: UpdatePagamentoDto): string;
    remove(id: number): string;
}
