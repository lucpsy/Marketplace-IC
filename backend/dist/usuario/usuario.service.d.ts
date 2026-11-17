import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdminUpdateUsuarioDto } from './dto/Admin-update-usuario.dto';
export declare class UsuarioService {
    private readonly repositorioUsuario;
    constructor(repositorioUsuario: Repository<Usuario>);
    createUser(createUsuarioDto: CreateUsuarioDto): Promise<Usuario>;
    removeUser(id: string): Promise<{
        message: string;
    }>;
    updateUser(id: string, dto: UpdateUsuarioDto): Promise<{
        message: string;
    }>;
    adminUpdateUser(id: string, dto: AdminUpdateUsuarioDto): Promise<{
        message: string;
    }>;
    findOneByEmail(email: string): Promise<Usuario>;
    findOneById(id: string): Promise<Usuario>;
    findOneByIdWithPassword(id: string): Promise<Usuario>;
    findOneByEmailWithPassword(email: string): Promise<Usuario>;
    findAll(): Promise<Usuario[]>;
}
