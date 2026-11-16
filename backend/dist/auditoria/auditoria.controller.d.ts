import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
export declare class AuditoriaController {
    private readonly auditoriaService;
    constructor(auditoriaService: AuditoriaService);
    create(createAuditoriaDto: CreateAuditoriaDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateAuditoriaDto: UpdateAuditoriaDto): string;
    remove(id: string): string;
}
