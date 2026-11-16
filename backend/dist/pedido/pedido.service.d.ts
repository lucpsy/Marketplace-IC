import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
export declare class PedidoService {
    create(createPedidoDto: CreatePedidoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePedidoDto: UpdatePedidoDto): string;
    remove(id: number): string;
}
