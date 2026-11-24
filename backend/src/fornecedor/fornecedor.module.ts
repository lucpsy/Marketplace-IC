import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FornecedorService } from './fornecedor.service';
import { FornecedorController } from './fornecedor.controller';
import { Fornecedor } from './entities/fornecedor.entity';
import { ConfiguracaoLoja } from '../pedido/entities/configuracao-loja.entity';
import { StatusPedido } from '../pedido/entities/status_pedido.entity';
import { TransicaoStatus } from '../pedido/entities/transicao-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fornecedor,
      ConfiguracaoLoja,
      StatusPedido,
      TransicaoStatus,
    ]),
  ],
  controllers: [FornecedorController],
  providers: [FornecedorService],
  exports: [FornecedorService],
})
export class FornecedorModule {}
