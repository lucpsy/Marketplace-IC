import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { Categoria } from './entities/categoria.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { Fornecedor } from '../fornecedor/entities/fornecedor.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
export declare class CatalogoService {
    private readonly produtoRepo;
    private readonly categoriaRepo;
    private readonly imagemRepo;
    private readonly fornecedorRepo;
    constructor(produtoRepo: Repository<Produto>, categoriaRepo: Repository<Categoria>, imagemRepo: Repository<ProdutoImagem>, fornecedorRepo: Repository<Fornecedor>);
    findAllProdutos(filtros?: {
        categoriaId?: string;
        fornecedorId?: string;
        busca?: string;
        apenasAtivos?: boolean;
    }): Promise<Produto[]>;
    findOneProduto(id: string): Promise<Produto>;
    createProduto(dto: CreateProdutoDto): Promise<Produto>;
    updateProduto(id: string, dto: UpdateProdutoDto): Promise<Produto>;
    removeProduto(id: string): Promise<{
        message: string;
    }>;
    findAllCategorias(): Promise<Categoria[]>;
    findOneCategoria(id: string): Promise<Categoria>;
    createCategoria(dto: CreateCategoriaDto): Promise<Categoria>;
    updateCategoria(id: string, dto: UpdateCategoriaDto): Promise<Categoria>;
    removeCategoria(id: string): Promise<{
        message: string;
    }>;
}
