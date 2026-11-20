import { ProdutoPromocao } from "./produto_promocao.entity";
export declare class Promocao {
    idPromocao: string;
    titulo: string;
    descricao: string | null;
    tipoDesconto: string;
    valorDesconto: string;
    dataInicio: Date;
    dataFim: Date;
    cor: string | null;
    codigo: string | null;
    valorMinimo: string | null;
    quantidadeMinima: number | null;
    status: string;
    dataCadastro: Date;
    produtosPromocao: ProdutoPromocao[];
}
