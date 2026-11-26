import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from '../../usuario/usuario.module';
import { getJwtSecret } from '../config/env.config';
import { HealthController } from './health.controller';
import { OptionalAuthService } from './optional-auth.service';

@Global()
@Module({
  imports: [
    UsuarioModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [OptionalAuthService],
  exports: [OptionalAuthService],
})
export class SecurityModule {}
