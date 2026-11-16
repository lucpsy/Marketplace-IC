import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioModule } from './usuario/usuario.module';
import { PromocaoModule } from './promo/promo.module';
import { PedidoModule } from './pedido/pedido.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { FornecedorModule } from './fornecedor/fornecedor.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { CarrinhoModule } from './carrinho/carrinho.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'marketplace',
      password: 'marketplace',
      database: 'marketplace',
      autoLoadEntities: true,
      synchronize: false,
    }),

    UsuarioModule,
    PromocaoModule,
    PedidoModule,
    PagamentoModule,
    NotificacaoModule,
    FornecedorModule,
    CatalogoModule,
    CarrinhoModule,
    AuditoriaModule,
  ],
})
export class AppModule {}