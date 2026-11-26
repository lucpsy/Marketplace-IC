import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CatalogoService } from './catalogo.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';
import { OptionalAuthService } from '../common/security/optional-auth.service';

@Controller('catalogo')
export class CatalogoController {
  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly optionalAuth: OptionalAuthService,
  ) {}

  /* -------------------------------------------------------- PRODUTOS */

  @Public()
  @Get('produtos')
  async findAllProdutos(
    @Req() req: Request,
    @Query('categoriaId') categoriaId?: string,
    @Query('fornecedorId') fornecedorId?: string,
    @Query('busca') busca?: string,
    @Query('apenasAtivos') apenasAtivos?: string,
  ) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    const filtrarApenasAtivos =
      isAdmin && apenasAtivos !== undefined ? apenasAtivos === 'true' : true;

    return this.catalogoService.findAllProdutos({
      categoriaId,
      fornecedorId,
      busca,
      apenasAtivos: filtrarApenasAtivos,
      incluirDadosInternos: isAdmin,
    });
  }

  @Public()
  @Get('produtos/:id')
  async findOneProduto(@Req() req: Request, @Param('id') id: string) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    return this.catalogoService.findOneProduto(id, !isAdmin);
  }

  @Admin()
  @Post('produtos')
  createProduto(@Body() dto: CreateProdutoDto) {
    return this.catalogoService.createProduto(dto);
  }

  @Admin()
  @Patch('produtos/:id')
  updateProduto(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.catalogoService.updateProduto(id, dto);
  }

  @Admin()
  @Delete('produtos/:id')
  removeProduto(@Param('id') id: string) {
    return this.catalogoService.removeProduto(id);
  }

  /* -------------------------------------------------------- CATEGORIAS */

  @Public()
  @Get('categorias')
  findAllCategorias() {
    return this.catalogoService.findAllCategorias();
  }

  @Public()
  @Get('categorias/:id')
  findOneCategoria(@Param('id') id: string) {
    return this.catalogoService.findOneCategoria(id);
  }

  @Admin()
  @Post('categorias')
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.catalogoService.createCategoria(dto);
  }

  @Admin()
  @Patch('categorias/:id')
  updateCategoria(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.catalogoService.updateCategoria(id, dto);
  }

  @Admin()
  @Delete('categorias/:id')
  removeCategoria(@Param('id') id: string) {
    return this.catalogoService.removeCategoria(id);
  }
}
