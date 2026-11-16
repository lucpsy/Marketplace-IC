import { Produto } from "../../catalogo/entities/produto.entity";
export declare class Fornecedor {
    idFornecedor: string;
    nomeRazaoSocial: string;
    nomeFantasia: string | null;
    email: string | null;
    telefone: string | null;
    status: string;
    dadosPagamento: string | null;
    dataCadastro: Date;
    produtos: Produto[];
}
