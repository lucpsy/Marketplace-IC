    import { PartialType, OmitType } from '@nestjs/swagger';
    import { CreateUsuarioDto } from './create-usuario.dto';
    import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

    export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['senhaHash'] as const),) {
        @IsOptional()
        @IsString()
        @MinLength(8)
        senha?:string;

        @ValidateIf((dto) => dto.senha !== undefined)
        @IsString()
        @IsNotEmpty()
        senhaAntiga?: string;
    }

