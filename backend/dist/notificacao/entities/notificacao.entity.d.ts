import { Usuario } from '../../usuario/entities/usuario.entity';
export declare class Notificacao {
    idNotificacao: string;
    usuario: Usuario;
    titulo: string;
    mensagem: string;
    tipo: string | null;
    lida: boolean;
    dataCriacao: Date;
}
