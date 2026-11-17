import { CatalogoService } from './catalogo.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
export declare class CatalogoController {
    private readonly catalogoService;
    constructor(catalogoService: CatalogoService);
    findAllProdutos(categoriaId?: string, fornecedorId?: string, busca?: string): Promise<import("./entities/produto.entity").Produto[]>;
    findOneProduto(id: string): Promise<import("./entities/produto.entity").Produto>;
    createProduto(dto: CreateProdutoDto): Promise<import("./entities/produto.entity").Produto>;
    updateProduto(id: string, dto: UpdateProdutoDto): Promise<import("./entities/produto.entity").Produto>;
    removeProduto(id: string): Promise<{
        message: string;
    }>;
    findAllCategorias(): Promise<import("./entities/categoria.entity").Categoria[]>;
    findOneCategoria(id: string): Promise<import("./entities/categoria.entity").Categoria>;
    createCategoria(dto: CreateCategoriaDto): Promise<import("./entities/categoria.entity").Categoria>;
    updateCategoria(id: string, dto: UpdateCategoriaDto): Promise<import("./entities/categoria.entity").Categoria>;
    removeCategoria(id: string): Promise<{
        message: string;
    }>;
}
