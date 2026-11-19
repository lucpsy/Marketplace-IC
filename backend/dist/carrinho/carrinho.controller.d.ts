import { CarrinhoService } from './carrinho.service';
import { AddItemCarrinhoDto } from './dto/add-item-carrinho.dto';
import { UpdateItemCarrinhoDto } from './dto/update-item-carrinho.dto';
export declare class CarrinhoController {
    private readonly carrinhoService;
    constructor(carrinhoService: CarrinhoService);
    private getUserId;
    obterCarrinho(req: any): Promise<{
        itens: import("./entities/carrinho-item.entity").CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: import("../usuario/entities/usuario.entity").Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    adicionarItem(req: any, dto: AddItemCarrinhoDto): Promise<{
        itens: import("./entities/carrinho-item.entity").CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: import("../usuario/entities/usuario.entity").Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    atualizarQuantidade(req: any, idItem: string, dto: UpdateItemCarrinhoDto): Promise<{
        itens: import("./entities/carrinho-item.entity").CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: import("../usuario/entities/usuario.entity").Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    removerItem(req: any, idItem: string): Promise<{
        itens: import("./entities/carrinho-item.entity").CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: import("../usuario/entities/usuario.entity").Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
    limparCarrinho(req: any): Promise<{
        itens: import("./entities/carrinho-item.entity").CarrinhoItem[];
        totalItens: number;
        subtotal: number;
        idCarrinho: string;
        usuario: import("../usuario/entities/usuario.entity").Usuario;
        status: string;
        dataCriacao: Date;
        dataAtualizacao: Date | null;
    }>;
}
