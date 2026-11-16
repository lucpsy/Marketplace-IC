import { Usuario } from '../../usuario/entities/usuario.entity';
import { CarrinhoItem } from './carrinho-item.entity';
export declare class Carrinho {
    idCarrinho: string;
    usuario: Usuario;
    status: string;
    dataCriacao: Date;
    dataAtualizacao: Date | null;
    itens: CarrinhoItem[];
}
