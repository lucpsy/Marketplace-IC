import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdminUpdateUsuarioDto } from './dto/Admin-update-usuario.dto';
export declare class UsuarioController {
    private readonly usuarioService;
    constructor(usuarioService: UsuarioService);
    updateProfile(req: any, dto: UpdateUsuarioDto): Promise<{
        message: string;
    }>;
    findOne(req: any): Promise<import("./entities/usuario.entity").Usuario>;
    adminfindOne(id: string): Promise<import("./entities/usuario.entity").Usuario>;
    findAll(): Promise<import("./entities/usuario.entity").Usuario[]>;
    updateAdmin(id: string, dto: AdminUpdateUsuarioDto): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
