import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdminUpdateUsuarioDto } from './dto/Admin-update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(@InjectRepository(Usuario) private readonly repositorioUsuario: Repository<Usuario>) { }

  async createUser(createUsuarioDto: CreateUsuarioDto) {
    if (await this.findOneByEmail(createUsuarioDto.email)) throw new ConflictException('Este Email já está cadastrado');
    const novo_usuario = this.repositorioUsuario.create(createUsuarioDto);
    return this.repositorioUsuario.save(novo_usuario);
  }

  async removeUser(id: string) {
    const usuario = await this.findOneById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    else {
      await this.repositorioUsuario.update(id, { status: 'inativo' },);
    }
    return { message: 'Usuário desativado com sucesso' };
  }

  async updateUser(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOneByIdWithPassword(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const dados = { ...dto };
    if (dados.senha) {
      if (await bcrypt.compare(dados.senhaAntiga, usuario.senhaHash)) {
        dados['senhaHash'] = await bcrypt.hash(dados.senha, 10);
        delete dados.senha;
        delete dados.senhaAntiga
      }
      else throw new UnauthorizedException('Senha antiga incorreta');
    }
    if (dados.email && await this.findOneByEmail(dados.email)) throw new ConflictException('Este Email já está cadastrado');
    await this.repositorioUsuario.update(id, dados);
    return { message: 'Usuário atualizado com sucesso' };
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUsuarioDto) {
    const usuario = await this.findOneById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const dados = { ...dto };
    if (dados.senha) {
      dados['senhaHash'] = await bcrypt.hash(dados.senha, 10);
      delete dados.senha;
    }
    if (dados.email && await this.findOneByEmail(dados.email)) throw new ConflictException('Este Email já está cadastrado');
    await this.repositorioUsuario.update(id, dados);
    return { message: 'Usuário atualizado com sucesso' };
  }

  findOneByEmail(email: string) {
    return this.repositorioUsuario.findOneBy({ email: email, });
  }

  findOneById(id: string) {
    return this.repositorioUsuario.findOneBy({ idUsuario: id, });
  }

  async findOneByIdWithPassword(id: string) {
    return this.repositorioUsuario
      .createQueryBuilder('usuario')
      .addSelect('usuario.senhaHash')
      .where('usuario.idUsuario = :id', { id })
      .getOne();
  }

  async findOneByEmailWithPassword(email: string) {
    return this.repositorioUsuario
      .createQueryBuilder('usuario')
      .addSelect('usuario.senhaHash')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  findAll() {
    return this.repositorioUsuario.find();
  }
}
