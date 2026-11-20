import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';
import { AddItemCarrinhoDto } from './dto/add-item-carrinho.dto';
import { UpdateItemCarrinhoDto } from './dto/update-item-carrinho.dto';

@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  private getUserId(req: any): string {
    return req.user.id ?? req.user.sub;
  }

  @Get()
  obterCarrinho(@Req() req: any, @Query('cupom') cupom?: string) {
    return this.carrinhoService.obterCarrinho(this.getUserId(req), cupom);
  }

  @Post('itens')
  adicionarItem(@Req() req: any, @Body() dto: AddItemCarrinhoDto) {
    return this.carrinhoService.adicionarItem(this.getUserId(req), dto);
  }

  @Patch('itens/:idItem')
  atualizarQuantidade(
    @Req() req: any,
    @Param('idItem') idItem: string,
    @Body() dto: UpdateItemCarrinhoDto,
  ) {
    return this.carrinhoService.atualizarQuantidade(
      this.getUserId(req),
      idItem,
      dto,
    );
  }

  @Delete('itens/:idItem')
  removerItem(@Req() req: any, @Param('idItem') idItem: string) {
    return this.carrinhoService.removerItem(this.getUserId(req), idItem);
  }

  @Delete()
  limparCarrinho(@Req() req: any) {
    return this.carrinhoService.limparCarrinho(this.getUserId(req));
  }
}
