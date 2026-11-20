import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PromocaoService } from './promo.service';
import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
import { UpdateStatusPromocaoDto } from './dto/update-status-promocao.dto';
import { VincularProdutosPromocaoDto } from './dto/vincular-produtos-promocao.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { SimularDescontoDto } from './dto/simular-desconto.dto';
export declare class PromocaoController {
    private readonly promocaoService;
    private readonly jwtService;
    constructor(promocaoService: PromocaoService, jwtService: JwtService);
    private isAdminRequest;
    findAtivas(): Promise<import("./entities/promocao.entity").Promocao[]>;
    findCuponsAtivos(): Promise<import("./entities/promocao.entity").Promocao[]>;
    validarCupom(dto: ValidarCupomDto): Promise<{
        valido: boolean;
        cupom: {
            valorMinimo: number;
            quantidadeMinima: number;
            produtoIds: string[];
            idPromocao: string;
            titulo: string;
            codigo: string | null;
            tipoDesconto: string;
            valorDesconto: number;
            cor: string | null;
            dataFim: Date;
        };
        descontoEstimado: number;
    }>;
    simularDesconto(dto: SimularDescontoDto): Promise<import("./promo.service").ResultadoCalculoDesconto>;
    findAll(req: Request, status?: string, tipoDesconto?: string, busca?: string, apenasAtivas?: string, somenteCupons?: string): Promise<import("./entities/promocao.entity").Promocao[]>;
    findOne(req: Request, id: string): Promise<import("./entities/promocao.entity").Promocao>;
    create(dto: CreatePromocaoDto): Promise<import("./entities/promocao.entity").Promocao>;
    update(id: string, dto: UpdatePromocaoDto): Promise<import("./entities/promocao.entity").Promocao>;
    updateStatus(id: string, dto: UpdateStatusPromocaoDto): Promise<import("./entities/promocao.entity").Promocao>;
    vincularProdutos(id: string, dto: VincularProdutosPromocaoDto): Promise<import("./entities/promocao.entity").Promocao>;
    desvincularProduto(id: string, idProduto: string): Promise<import("./entities/promocao.entity").Promocao>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
