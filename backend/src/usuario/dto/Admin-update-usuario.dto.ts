import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class AdminUpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['senhaHash'] as const),) {
    @IsOptional()
    @IsString()
    @MinLength(8)
    senha?: string;
}

