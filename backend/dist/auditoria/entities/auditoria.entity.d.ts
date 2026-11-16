import { Usuario } from "../../usuario/entities/usuario.entity";
export declare class Auditoria {
    idLog: string;
    usuario: Usuario;
    acao: string;
    entidade: string;
    idRegistro: string;
    detalhes: string | null;
    ip: string;
    dataRegistro: Date;
}
