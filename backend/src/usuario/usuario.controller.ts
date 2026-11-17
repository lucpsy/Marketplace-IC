import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Admin } from 'auth/decorators/role.decorator';
import { Public } from 'auth/decorators/public.decorator';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Public()
  @Post('create')
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.createUser(dto);
  }

  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.updateUser(req.user.id, dto);
  }

  @Get('profile')
  findOne(@Req() req){
    return this.usuarioService.findOneById(req.user.id);
  }

  @Admin()
  @Get(':id')
  adminfindOne(@Param('id') id : string){
    return this.usuarioService.findOneById(id);
  }

  @Admin()
  @Get()
  findAll(){
    return this.usuarioService.findAll();
  }

  @Admin()
  @Patch(':id')
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.adminUpdateUser(id, dto);
  }
  
  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string){
    return this.usuarioService.removeUser(id);
  }
}
