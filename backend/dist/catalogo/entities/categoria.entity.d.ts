import { Produto } from "./produto.entity";
export declare class Categoria {
    idCategoria: string;
    categoriaPai: Categoria | null;
    subcategorias: Categoria[];
    nome: string;
    descricao: string | null;
    ativo: boolean;
    produtos: Produto[];
}
