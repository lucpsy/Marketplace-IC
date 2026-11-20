import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { Pagamento } from './entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pagamento])],
  controllers: [PagamentoController],
  providers: [PagamentoService],
})
export class PagamentoModule {}
