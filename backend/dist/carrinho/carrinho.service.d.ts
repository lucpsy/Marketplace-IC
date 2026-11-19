import { Repository } from 'typeorm';
import { Carrinho } from './entities/carrinho.entity';
import { CarrinhoItem } from './entities/carrinho-item.entity';
import { Produto } from '../catalogo/entities/produto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AddItemCarrinhoDto } from './dto/add-item-carrinho.dto';
import { UpdateItemCarrinhoDto } from './dto/update-item-carrinho.dto';
export declare class CarrinhoService {
    private readonly carrinhoRepo;
    private readonly itemRepo;
    private readonly produtoRepo;
    private readonly usuarioRepo;
    constructor(carrinhoRepo: Repository<Carrinho>, itemRepo: Repository<CarrinhoItem>, produtoRepo: Repository<Produto>, usuarioRepo: Repository<Usuario>);
    private getOrCreateCarrinho;
    obterCarrinho(usuarioId: string): Promise<{
        itens: CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    adicionarItem(usuarioId: string, dto: AddItemCarrinhoDto): Promise<{
        itens: CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    atualizarQuantidade(usuarioId: string, idItem: string, dto: UpdateItemCarrinhoDto): Promise<{
        itens: CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    removerItem(usuarioId: string, idItem: string): Promise<{
        itens: CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    limparCarrinho(usuarioId: string): Promise<{
        itens: CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
}
