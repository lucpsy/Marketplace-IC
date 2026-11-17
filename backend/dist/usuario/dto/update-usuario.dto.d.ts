import { CreateUsuarioDto } from './create-usuario.dto';
declare const UpdateUsuarioDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUsuarioDto, "senhaHash">>>;
export declare class UpdateUsuarioDto extends UpdateUsuarioDto_base {
    senha?: string;
    senhaAntiga?: string;
}
export {};
