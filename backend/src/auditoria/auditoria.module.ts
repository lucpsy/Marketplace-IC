import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { Auditoria } from './entities/log_auditoria.entity';
import { AuditInterceptor } from './audit.interceptor';
import { AuditExceptionFilter } from './audit-exception.filter';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditInterceptor, AuditExceptionFilter],
  exports: [AuditoriaService, AuditInterceptor, AuditExceptionFilter],
})
export class AuditoriaModule {}
