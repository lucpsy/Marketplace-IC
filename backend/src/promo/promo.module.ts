import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PromocaoService } from "./promo.service";
import { PromocaoController } from "./promo.controller";
import { Promocao } from "./entities/promocao.entity";
import { ProdutoPromocao } from "./entities/produto_promocao.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Promocao, ProdutoPromocao])],
  controllers: [PromocaoController],
  providers: [PromocaoService],
})
export class PromocaoModule {}
