import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from 'usuario/usuario.module';
import { JwtModule} from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
    UsuarioModule,
    JwtModule.register({secret: process.env.JWT_SECRET,signOptions: { expiresIn: '1d' },}),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,JwtStrategy,
    ],
})
export class AuthModule {}
