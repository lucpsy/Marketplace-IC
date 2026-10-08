export type Produto = {
  id: number;
  empresa: string;
  nome: string;
  tipo: string;
  preco: number;
  desconto?: number;
  evento?: string;
  imagens: string[];
};