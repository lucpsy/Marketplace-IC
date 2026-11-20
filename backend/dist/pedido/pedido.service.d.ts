import { OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { StatusPedido } from './entities/status_pedido.entity';
import { TransicaoStatus } from './entities/transicao-status.entity';
import { Carrinho } from '../carrinho/entities/carrinho.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { PromocaoService } from '../promo/promo.service';
export declare class PedidoService implements OnModuleInit {
    private readonly dataSource;
    private readonly pedidoRepo;
    private readonly statusRepo;
    private readonly transicaoRepo;
    private readonly carrinhoRepo;
    private readonly usuarioRepo;
    private readonly promocaoService;
    constructor(dataSource: DataSource, pedidoRepo: Repository<Pedido>, statusRepo: Repository<StatusPedido>, transicaoRepo: Repository<TransicaoStatus>, carrinhoRepo: Repository<Carrinho>, usuarioRepo: Repository<Usuario>, promocaoService: PromocaoService);
    onModuleInit(): Promise<void>;
    listarStatus(): Promise<StatusPedido[]>;
    listarTransicoesPermitidas(idStatus: string): Promise<StatusPedido[]>;
    criarDoCarrinho(usuarioId: string, dto: CreatePedidoDto): Promise<Pedido>;
    findMeusPedidos(usuarioId: string): Promise<Pedido[]>;
    findAll(filtros?: {
        statusId?: string;
        usuarioId?: string;
    }): Promise<Pedido[]>;
    findOne(idPedido: string, usuarioId: string, isAdmin: boolean): Promise<Pedido>;
    atualizarStatus(idPedido: string, dto: UpdateStatusPedidoDto, responsavelId: string): Promise<Pedido>;
}
