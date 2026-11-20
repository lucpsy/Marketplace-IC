import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CatalogoService } from './catalogo.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
export declare class CatalogoController {
    private readonly catalogoService;
    private readonly jwtService;
    constructor(catalogoService: CatalogoService, jwtService: JwtService);
    findAllProdutos(req: Request, categoriaId?: string, fornecedorId?: string, busca?: string, apenasAtivos?: string): Promise<import("../promo/promo.service").ProdutoComPromocao[]>;
    findOneProduto(id: string): Promise<import("../promo/promo.service").ProdutoComPromocao>;
    createProduto(dto: CreateProdutoDto): Promise<import("../promo/promo.service").ProdutoComPromocao>;
    updateProduto(id: string, dto: UpdateProdutoDto): Promise<import("../promo/promo.service").ProdutoComPromocao>;
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
