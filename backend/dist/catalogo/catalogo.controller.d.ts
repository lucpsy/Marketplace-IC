import { CatalogoService } from './catalogo.service';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
export declare class CatalogoController {
    private readonly catalogoService;
    constructor(catalogoService: CatalogoService);
    create(createCatalogoDto: CreateCatalogoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCatalogoDto: UpdateCatalogoDto): string;
    remove(id: string): string;
}
