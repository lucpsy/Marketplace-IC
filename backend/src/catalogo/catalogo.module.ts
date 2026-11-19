import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';
import { Produto } from './entities/produto.entity';
import { Categoria } from './entities/categoria.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { Fornecedor } from '../fornecedor/entities/fornecedor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Categoria, ProdutoImagem, Fornecedor]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
