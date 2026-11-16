import { Produto } from "./produto.entity";
export declare class ProdutoImagem {
    idImagem: string;
    produto: Produto;
    urlImagem: string;
    textoAlternativo: string | null;
    ordem: number;
    imagemPrincipal: boolean;
}
