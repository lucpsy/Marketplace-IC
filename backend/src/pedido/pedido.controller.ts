import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { SolicitarReembolsoDto } from './dto/solicitar-reembolso.dto';
import { EfetivarReembolsoDto } from './dto/efetivar-reembolso.dto';
import { Admin } from '../auth/decorators/role.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RateLimit } from '../common/security/rate-limit.guard';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function validarAssinaturaArquivo(buffer: Buffer, ext: string): boolean {
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
  if (ext === '.pdf') {
    return buffer.subarray(0, 4).toString('ascii') === '%PDF';
  }
  return false;
}

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  private getUserId(req: any): string {
    return req.user.id ?? req.user.sub;
  }

  @RateLimit(10, 10 * 60_000, 'upload-comprovante')
  @Post('upload-comprovante')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  async uploadComprovante(
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
      throw new BadRequestException('Nenhum arquivo de comprovante enviado');
    }

    if (file.size > MAX_UPLOAD_BYTES || file.buffer.length > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        'O arquivo excede o tamanho máximo permitido de 5 MB.',
      );
    }

    const ext = MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new BadRequestException(
        'Formato inválido. Envie PNG, JPG, WEBP ou PDF.',
      );
    }

    if (!validarAssinaturaArquivo(file.buffer, ext)) {
      throw new BadRequestException(
        'Conteúdo do arquivo não corresponde ao formato permitido (PNG, JPG, WEBP ou PDF).',
      );
    }

    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    await this.pedidoService.salvarComprovante({
      filename,
      nomeOriginal: file.originalname || null,
      mimetype: file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype,
      tamanho: file.buffer.length,
      dados: file.buffer,
      usuarioId: this.getUserId(req),
    });

    return {
      url: `/api/pedido/comprovantes/${filename}`,
      filename,
      mimetype: file.mimetype,
      size: file.buffer.length,
    };
  }

  @Public()
  @Get('comprovantes/repasse/:filename')
  async baixarComprovanteRepassePublico(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, mimeType } =
      await this.pedidoService.obterComprovanteRepassePublico(filename);

    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    });

    return new StreamableFile(buffer);
  }

  @Get('comprovantes/:filename')
  async baixarComprovante(
    @Req() req: any,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isAdmin = req.user?.role === 'admin';
    const { buffer, mimeType } =
      await this.pedidoService.obterComprovanteProtegido(
        filename,
        this.getUserId(req),
        isAdmin,
      );

    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=300',
    });

    return new StreamableFile(buffer);
  }

  @Public()
  @Get('prazo-compras')
  obterPrazoCompras() {
    return this.pedidoService.obterPrazoCompras();
  }

  @Admin()
  @Patch('prazo-compras')
  atualizarPrazoCompras(@Body('offerDeadline') offerDeadline: string) {
    return this.pedidoService.atualizarPrazoCompras(offerDeadline);
  }

  @Public()
  @Get('status')
  listarStatus() {
    return this.pedidoService.listarStatus();
  }

  @Admin()
  @Get('status/:idStatus/transicoes')
  listarTransicoesPermitidas(@Param('idStatus') idStatus: string) {
    return this.pedidoService.listarTransicoesPermitidas(idStatus);
  }

  @Post()
  criarDoCarrinho(@Req() req: any, @Body() dto: CreatePedidoDto) {
    return this.pedidoService.criarDoCarrinho(this.getUserId(req), dto);
  }

  @Get('meus')
  findMeusPedidos(@Req() req: any) {
    return this.pedidoService.findMeusPedidos(this.getUserId(req));
  }

  @Admin()
  @Get()
  findAll(
    @Query('statusId') statusId?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    return this.pedidoService.findAll({ statusId, usuarioId });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const isAdmin = req.user?.role === 'admin';
    return this.pedidoService.findOne(id, this.getUserId(req), isAdmin);
  }

  @Admin()
  @Patch(':id/status')
  atualizarStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusPedidoDto,
  ) {
    return this.pedidoService.atualizarStatus(id, dto, this.getUserId(req));
  }

  @Admin()
  @Patch(':id/confirmar-pagamento')
  confirmarPagamento(@Req() req: any, @Param('id') id: string) {
    return this.pedidoService.confirmarPagamento(id, this.getUserId(req));
  }

  @Post(':id/solicitar-reembolso')
  solicitarReembolso(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SolicitarReembolsoDto,
  ) {
    const isAdmin = req.user?.role === 'admin';
    return this.pedidoService.solicitarReembolso(
      id,
      this.getUserId(req),
      isAdmin,
      dto,
    );
  }

  @Admin()
  @Patch(':id/reembolsar')
  efetivarReembolso(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: EfetivarReembolsoDto,
  ) {
    return this.pedidoService.efetivarReembolso(id, this.getUserId(req), dto);
  }
}
