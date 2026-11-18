import { PartialType } from '@nestjs/swagger';
import { CreatePromocaoDto } from './create-promocao.dto';

export class UpdatePromocaoDto extends PartialType(CreatePromocaoDto) {}
