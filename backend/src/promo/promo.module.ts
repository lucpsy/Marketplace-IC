import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PromocaoService } from './promo.service';
import { PromocaoController } from './promo.controller';
import { Promocao } from './entities/promocao.entity';
import { ProdutoPromocao } from './entities/produto_promocao.entity';
import { Produto } from '../catalogo/entities/produto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocao, ProdutoPromocao, Produto]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [PromocaoController],
  providers: [PromocaoService],
  exports: [PromocaoService],
})
export class PromocaoModule {}
