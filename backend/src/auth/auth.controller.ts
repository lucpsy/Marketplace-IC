import { Controller, Post, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDto} from './dto/create-account.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

    @Public()
    @Post('register')
    create(@Body() dto: CreateAccountDto) {
        return this.authservice.create(dto);
    }

    @Public()
    @Post('login')    
    login(@Body() dto: LoginAccountDto){
        return this.authservice.login(dto);
    }

}
