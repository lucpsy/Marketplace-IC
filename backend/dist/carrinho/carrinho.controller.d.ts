import { CarrinhoService } from './carrinho.service';
import { CreateCarrinhoDto } from './dto/create-carrinho.dto';
import { UpdateCarrinhoDto } from './dto/update-carrinho.dto';
export declare class CarrinhoController {
    private readonly carrinhoService;
    constructor(carrinhoService: CarrinhoService);
    create(createCarrinhoDto: CreateCarrinhoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCarrinhoDto: UpdateCarrinhoDto): string;
    remove(id: string): string;
}
