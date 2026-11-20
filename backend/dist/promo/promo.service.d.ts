import { DataSource, Repository } from 'typeorm';
import { Promocao } from './entities/promocao.entity';
import { ProdutoPromocao } from './entities/produto_promocao.entity';
import { Produto } from '../catalogo/entities/produto.entity';
import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
import { UpdateStatusPromocaoDto } from './dto/update-status-promocao.dto';
import { VincularProdutosPromocaoDto } from './dto/vincular-produtos-promocao.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { SimularDescontoDto } from './dto/simular-desconto.dto';
export interface PromocaoResumo {
    idPromocao: string;
    titulo: string;
    codigo: string | null;
    tipoDesconto: string;
    valorDesconto: number;
    cor: string | null;
    dataFim: Date;
}
export interface PromocaoAplicadaResumo {
    idPromocao: string;
    titulo: string;
    codigo: string | null;
    tipoDesconto: string;
    valorDesconto: number;
    categoria: 'produto' | 'combo' | 'cupom';
    valorEconomizado: number;
}
export interface ItemCalculoEntrada {
    produto: Produto;
    quantidade: number;
}
export interface ItemCalculoResultado {
    idProduto: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
    precoUnitarioFinal: number;
    descontoUnitario: number;
    descontoTotalItem: number;
    subtotalBrutoItem: number;
    valorTotalItem: number;
    promocaoAplicada: PromocaoResumo | null;
}
export interface ResultadoCalculoDesconto {
    subtotalBruto: number;
    descontoProdutos: number;
    descontoCombos: number;
    descontoCupom: number;
    descontoTotal: number;
    freteOriginal: number;
    descontoFrete: number;
    freteFinal: number;
    valorTotal: number;
    promocoesAplicadas: PromocaoAplicadaResumo[];
    cupomAplicado: PromocaoResumo | null;
    itens: ItemCalculoResultado[];
}
export interface ProdutoComPromocao extends Produto {
    precoPromocional: number | null;
    promocaoAtiva: PromocaoResumo | null;
}
export declare class PromocaoService {
    private readonly dataSource;
    private readonly promocaoRepo;
    private readonly produtoPromocaoRepo;
    private readonly produtoRepo;
    constructor(dataSource: DataSource, promocaoRepo: Repository<Promocao>, produtoPromocaoRepo: Repository<ProdutoPromocao>, produtoRepo: Repository<Produto>);
    private round2;
    private normalizarCodigo;
    private isVigente;
    private toResumo;
    private validarRegrasPromocao;
    private validarCodigoUnico;
    private buscarEValidarProdutos;
    private calcularDescontoValor;
    create(dto: CreatePromocaoDto): Promise<Promocao>;
    findAll(filtros?: {
        status?: string;
        tipoDesconto?: string;
        busca?: string;
        apenasAtivas?: boolean;
        somenteCupons?: boolean;
    }): Promise<Promocao[]>;
    findAtivas(): Promise<Promocao[]>;
    findCuponsAtivos(): Promise<Promocao[]>;
    findOne(id: string, apenasAtiva?: boolean): Promise<Promocao>;
    update(id: string, dto: UpdatePromocaoDto): Promise<Promocao>;
    updateStatus(id: string, dto: UpdateStatusPromocaoDto): Promise<Promocao>;
    vincularProdutos(id: string, dto: VincularProdutosPromocaoDto): Promise<Promocao>;
    desvincularProduto(id: string, idProduto: string): Promise<Promocao>;
    remove(id: string): Promise<{
        message: string;
    }>;
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
    private carregarPromocoesVigentes;
    private ehCampanhaDiretaProduto;
    enriquecerProdutosComPromocao(produtos: Produto[]): Promise<ProdutoComPromocao[]>;
    calcularDescontos(params: {
        itens: ItemCalculoEntrada[];
        codigoCupom?: string;
        frete?: number;
    }): Promise<ResultadoCalculoDesconto>;
    simularDesconto(dto: SimularDescontoDto): Promise<ResultadoCalculoDesconto>;
}
