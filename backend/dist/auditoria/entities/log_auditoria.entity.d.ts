import { Usuario } from "../../usuario/entities/usuario.entity";
export declare class Auditoria {
    idLog: string;
    usuario: Usuario | null;
    acao: string;
    entidade: string;
    idRegistro: string | null;
    detalhes: string | null;
    ip: string | null;
    dataRegistro: Date;
}
