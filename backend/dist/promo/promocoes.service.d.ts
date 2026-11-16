import { CreatePromocaoDto } from './dto/create-promocao.dto';
import { UpdatePromocaoDto } from './dto/update-promocao.dto';
export declare class PromocaoService {
    create(createPromocaoDto: CreatePromocaoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePromocaoDto: UpdatePromocaoDto): string;
    remove(id: number): string;
}
