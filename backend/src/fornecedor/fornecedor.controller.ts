import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/role.decorator';
import { OptionalAuthService } from '../common/security/optional-auth.service';

@Controller('fornecedor')
export class FornecedorController {
  constructor(
    private readonly fornecedorService: FornecedorService,
    private readonly optionalAuth: OptionalAuthService,
  ) {}

  @Admin()
  @Post()
  create(@Body() createFornecedorDto: CreateFornecedorDto) {
    return this.fornecedorService.create(createFornecedorDto);
  }

  @Public()
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('busca') busca?: string,
  ) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    return this.fornecedorService.findAll({
      status: isAdmin ? status : 'ativo',
      busca,
      apenasPublico: !isAdmin,
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const isAdmin = await this.optionalAuth.isActiveAdmin(req);
    return this.fornecedorService.findOne(id, !isAdmin);
  }

  @Admin()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFornecedorDto: UpdateFornecedorDto,
  ) {
    return this.fornecedorService.update(id, updateFornecedorDto);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fornecedorService.remove(id);
  }
}
