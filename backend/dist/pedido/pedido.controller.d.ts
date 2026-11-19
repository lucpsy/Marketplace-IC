import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
export declare class PedidoController {
    private readonly pedidoService;
    constructor(pedidoService: PedidoService);
    private getUserId;
    listarStatus(): Promise<import("./entities/status_pedido.entity").StatusPedido[]>;
    listarTransicoesPermitidas(idStatus: string): Promise<import("./entities/status_pedido.entity").StatusPedido[]>;
    criarDoCarrinho(req: any, dto: CreatePedidoDto): Promise<import("./entities/pedido.entity").Pedido>;
    findMeusPedidos(req: any): Promise<import("./entities/pedido.entity").Pedido[]>;
    findAll(statusId?: string, usuarioId?: string): Promise<import("./entities/pedido.entity").Pedido[]>;
    findOne(req: any, id: string): Promise<import("./entities/pedido.entity").Pedido>;
    atualizarStatus(req: any, id: string, dto: UpdateStatusPedidoDto): Promise<import("./entities/pedido.entity").Pedido>;
}
