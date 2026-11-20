import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item_pedido.entity';
import { StatusPedido } from './entities/status_pedido.entity';
import { TransicaoStatus } from './entities/transicao-status.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { Carrinho } from '../carrinho/entities/carrinho.entity';
import { CarrinhoItem } from '../carrinho/entities/carrinho-item.entity';
import { Produto } from '../catalogo/entities/produto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { PromocaoModule } from '../promo/promo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      ItemPedido,
      StatusPedido,
      TransicaoStatus,
      HistoricoStatus,
      Carrinho,
      CarrinhoItem,
      Produto,
      Usuario,
    ]),
    PromocaoModule,
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
