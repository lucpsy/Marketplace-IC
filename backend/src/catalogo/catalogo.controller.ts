import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { CatalogoService } from './catalogo.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';
import { OptionalAuthService } from '../common/security/optional-auth.service';
import { RateLimit } from '../common/security/rate-limit.guard';

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
};

function validarAssinaturaImagem(buffer: Buffer, ext: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  if (ext === '.png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (ext === '.jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (ext === '.webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

@Controller('catalogo')
export class CatalogoController {
  constructor(
    private readonly catalogoService: CatalogoService,
    private readonly optionalAuth: OptionalAuthService,
  ) {}

  /* -------------------------------------------------------- IMAGENS */

  @Admin()
  @RateLimit(30, 10 * 60_000, 'upload-imagem-produto')
  @Post('upload-imagem')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PRODUCT_IMAGE_BYTES },
    }),
  )
  async uploadImagemProduto(
    @Req() req: any,
    @UploadedFile()
    file?: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada.');
    }

    if (
      file.size > MAX_PRODUCT_IMAGE_BYTES ||
      file.buffer.length > MAX_PRODUCT_IMAGE_BYTES
    ) {
      throw new BadRequestException(
        'A imagem excede o tamanho máximo permitido de 5 MB.',
      );
    }

    const ext = IMAGE_MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException(
        'Formato inválido. Envie PNG, JPG ou WEBP.',
      );
    }

    if (!validarAssinaturaImagem(file.buffer, ext)) {
      throw new BadRequestException(
        'Conteúdo do arquivo não corresponde a uma imagem válida (PNG, JPG ou WEBP).',
      );
    }

    const filename = `prod-${Date.now()}-${randomUUID()}${ext}`;
    await this.catalogoService.salvarImagemProduto({
      filename,
      nomeOriginal: file.originalname || null,
      mimetype: file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype,
      tamanho: file.buffer.length,
      dados: file.buffer,
      usuarioId: req.user?.id ?? req.user?.sub,
    });

    return {
      url: `/api/catalogo/imagens/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.buffer.length,
    };
  }

  @Public()
  @Get('imagens/:filename')
  async baixarImagemProduto(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, mimeType } =
      await this.catalogoService.obterImagemProdutoPublica(filename);

    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=86400',
    });

    return new StreamableFile(buffer);
  }

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
