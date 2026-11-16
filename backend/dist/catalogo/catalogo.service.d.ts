import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
export declare class CatalogoService {
    create(createCatalogoDto: CreateCatalogoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCatalogoDto: UpdateCatalogoDto): string;
    remove(id: number): string;
}
