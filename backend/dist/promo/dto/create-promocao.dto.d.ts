export declare const TIPOS_DESCONTO: readonly ["percentual", "fixo", "frete_gratis"];
export type TipoDesconto = (typeof TIPOS_DESCONTO)[number];
export declare const STATUS_PROMOCAO: readonly ["rascunho", "ativa", "inativa", "encerrada"];
export type StatusPromocao = (typeof STATUS_PROMOCAO)[number];
export declare class CreatePromocaoDto {
    titulo: string;
    descricao?: string;
    tipoDesconto: TipoDesconto;
    valorDesconto: number;
    dataInicio: string;
    dataFim: string;
    cor?: string;
    codigo?: string;
    valorMinimo?: number;
    quantidadeMinima?: number;
    status?: StatusPromocao;
    produtoIds?: string[];
}
