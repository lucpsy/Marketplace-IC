import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CatalogoService } from "./catalogo.service";
import { CatalogoController } from "./catalogo.controller";
import { Produto } from "./entities/produto.entity";
import { Categoria } from "./entities/categoria.entity";
import { ProdutoImagem } from "./entities/produto-imagem.entity";
import { Fornecedor } from "../fornecedor/entities/fornecedor.entity";
import { Carrinho } from "../carrinho/entities/carrinho.entity";
import { CarrinhoItem } from "../carrinho/entities/carrinho-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Categoria, ProdutoImagem, Fornecedor]),
    TypeOrmModule.forFeature([Carrinho, CarrinhoItem]),
  ],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
