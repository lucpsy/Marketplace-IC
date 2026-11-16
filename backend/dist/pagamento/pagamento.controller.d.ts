import { PagamentoService } from './pagamento.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
export declare class PagamentoController {
    private readonly pagamentoService;
    constructor(pagamentoService: PagamentoService);
    create(createPagamentoDto: CreatePagamentoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePagamentoDto: UpdatePagamentoDto): string;
    remove(id: string): string;
}
