import { NotificacaoService } from './notificacao.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';
export declare class NotificacaoController {
    private readonly notificacaoService;
    constructor(notificacaoService: NotificacaoService);
    create(createNotificacaoDto: CreateNotificacaoDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateNotificacaoDto: UpdateNotificacaoDto): string;
    remove(id: string): string;
}
