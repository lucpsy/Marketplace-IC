import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
export declare class AuditoriaService {
    create(createAuditoriaDto: CreateAuditoriaDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateAuditoriaDto: UpdateAuditoriaDto): string;
    remove(id: number): string;
}
