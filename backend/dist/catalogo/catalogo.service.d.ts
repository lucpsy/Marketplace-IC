import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { Categoria } from './entities/categoria.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { Fornecedor } from '../fornecedor/entities/fornecedor.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { PromocaoService } from '../promo/promo.service';
export declare class CatalogoService {
    private readonly produtoRepo;
    private readonly categoriaRepo;
    private readonly imagemRepo;
    private readonly fornecedorRepo;
    private readonly promocaoService;
    constructor(produtoRepo: Repository<Produto>, categoriaRepo: Repository<Categoria>, imagemRepo: Repository<ProdutoImagem>, fornecedorRepo: Repository<Fornecedor>, promocaoService: PromocaoService);
    findAllProdutos(filtros?: {
        categoriaId?: string;
        fornecedorId?: string;
        busca?: string;
        apenasAtivos?: boolean;
    }): Promise<import("../promo/promo.service").ProdutoComPromocao[]>;
    private findOneProdutoEntity;
    findOneProduto(id: string): Promise<import("../promo/promo.service").ProdutoComPromocao>;
    createProduto(dto: CreateProdutoDto): Promise<import("../promo/promo.service").ProdutoComPromocao>;
    updateProduto(id: string, dto: UpdateProdutoDto): Promise<import("../promo/promo.service").ProdutoComPromocao>;
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
