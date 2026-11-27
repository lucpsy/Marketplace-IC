import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';
import { Produto } from './entities/produto.entity';
import { Categoria } from './entities/categoria.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { Fornecedor } from '../fornecedor/entities/fornecedor.entity';
import { ArquivoUpload } from '../pedido/entities/arquivo-upload.entity';
import { PromocaoModule } from '../promo/promo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produto,
      Categoria,
      ProdutoImagem,
      Fornecedor,
      ArquivoUpload,
    ]),
    PromocaoModule,
  ],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
