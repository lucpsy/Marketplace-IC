import { PromocaoService } from './promocoes.service';
import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
export declare class PromocaoController {
    private readonly promocaoService;
    constructor(promocaoService: PromocaoService);
    create(createPromocaoDto: CreatePromocaoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePromocaoDto: UpdatePromocaoDto): string;
    remove(id: string): string;
}
