import { CreateCarrinhoDto } from './dto/create-carrinho.dto';
import { UpdateCarrinhoDto } from './dto/update-carrinho.dto';
export declare class CarrinhoService {
    create(createCarrinhoDto: CreateCarrinhoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateCarrinhoDto: UpdateCarrinhoDto): string;
    remove(id: number): string;
}
