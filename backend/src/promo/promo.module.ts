import { Module } from '@nestjs/common';
import { PromocaoService } from './promo.service';
import { PromocaoController } from './promo.controller';

@Module({
  controllers: [PromocaoController],
  providers: [PromocaoService],
})
export class PromocaoModule {}
