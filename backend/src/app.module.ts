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
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';
import { AuthModule } from './auth/auth.module';
import { getDatabaseConfig } from './common/config/env.config';
import { AuthCookieInterceptor } from './common/security/auth-cookie';
import { RateLimitGuard } from './common/security/rate-limit.guard';
import { SecurityModule } from './common/security/security.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        ...getDatabaseConfig(),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    SecurityModule,
    UsuarioModule,
    PromocaoModule,
    PedidoModule,
    PagamentoModule,
    NotificacaoModule,
    FornecedorModule,
    CatalogoModule,
    CarrinhoModule,
    AuditoriaModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthCookieInterceptor,
    },
  ],
})
export class AppModule {}