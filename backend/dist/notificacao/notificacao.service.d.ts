import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';
export declare class NotificacaoService {
    create(createNotificacaoDto: CreateNotificacaoDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateNotificacaoDto: UpdateNotificacaoDto): string;
    remove(id: number): string;
}
