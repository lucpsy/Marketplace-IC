import { PartialType } from '@nestjs/swagger';
import { CreateProdutoDto } from './create-produto.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsOptional()
  @IsString()
  status?: string;
}
