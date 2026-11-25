import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpdateUsuarioDto extends PartialType(
    OmitType(CreateUsuarioDto, ['senhaHash'] as const),
) {
    @IsOptional()
    @IsString()
    @MinLength(8)
    senha?: string;

    @IsOptional()
    @IsString()
    @IsIn(['cliente', 'admin'])
    cargo?: string;

    @IsOptional()
    @IsString()
    @IsIn(['ativo', 'inativo'])
    status?: string;
}

