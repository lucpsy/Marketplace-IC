import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
export declare class PedidoController {
    private readonly pedidoService;
    constructor(pedidoService: PedidoService);
    create(createPedidoDto: CreatePedidoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePedidoDto: UpdatePedidoDto): string;
    remove(id: string): string;
}
