import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from './entities/carrinho.entity';
import { CarrinhoItem } from './entities/carrinho-item.entity';
import { Produto } from '../catalogo/entities/produto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AddItemCarrinhoDto } from './dto/add-item-carrinho.dto';
import { UpdateItemCarrinhoDto } from './dto/update-item-carrinho.dto';
import { PromocaoService } from '../promo/promo.service';

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private readonly carrinhoRepo: Repository<Carrinho>,

    @InjectRepository(CarrinhoItem)
    private readonly itemRepo: Repository<CarrinhoItem>,

    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    private readonly promocaoService: PromocaoService,
  ) {}

  private async getOrCreateCarrinho(usuarioId: string): Promise<Carrinho> {
    let carrinho = await this.carrinhoRepo.findOne({
      where: { usuario: { idUsuario: usuarioId } },
    });

    if (!carrinho) {
      const usuario = await this.usuarioRepo.findOneBy({ idUsuario: usuarioId });
      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      carrinho = this.carrinhoRepo.create({
        usuario,
        status: 'ativo',
      });
      carrinho = await this.carrinhoRepo.save(carrinho);
    }

    return carrinho;
  }

  async obterCarrinho(usuarioId: string, codigoCupom?: string) {
    const carrinhoBase = await this.getOrCreateCarrinho(usuarioId);

    const carrinho = await this.carrinhoRepo.findOne({
      where: { idCarrinho: carrinhoBase.idCarrinho },
      relations: [
        'itens',
        'itens.produto',
        'itens.produto.imagens',
        'itens.produto.fornecedor',
      ],
      order: {
        itens: {
          idCarrinhoItem: 'ASC',
        },
      },
    });

    const itens = carrinho?.itens ?? [];
    const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

    if (itens.length === 0) {
      return {
        ...carrinho,
        itens: [],
        totalItens: 0,
        subtotal: 0,
        descontoProdutos: 0,
        descontoCombos: 0,
        descontoCupom: 0,
        descontoTotal: 0,
        totalComDesconto: 0,
        promocoesAplicadas: [],
        cupomAplicado: null,
      };
    }

    const calculo = await this.promocaoService.calcularDescontos({
      itens: itens.map((item) => ({
        produto: item.produto,
        quantidade: item.quantidade,
      })),
      codigoCupom,
    });

    const itensEnriquecidos = itens.map((item, idx) => {
      const calcItem = calculo.itens[idx];
      return {
        ...item,
        precoUnitarioFinal: calcItem?.precoUnitarioFinal ?? Number(item.precoUnitario),
        descontoUnitario: calcItem?.descontoUnitario ?? 0,
        descontoTotalItem: calcItem?.descontoTotalItem ?? 0,
        valorTotalItem:
          calcItem?.valorTotalItem ??
          Number((Number(item.precoUnitario) * item.quantidade).toFixed(2)),
        promocaoAplicada: calcItem?.promocaoAplicada ?? null,
      };
    });

    return {
      ...carrinho,
      itens: itensEnriquecidos,
      totalItens,
      subtotal: calculo.subtotalBruto,
      descontoProdutos: calculo.descontoProdutos,
      descontoCombos: calculo.descontoCombos,
      descontoCupom: calculo.descontoCupom,
      descontoTotal: calculo.descontoTotal,
      totalComDesconto: calculo.valorTotal,
      promocoesAplicadas: calculo.promocoesAplicadas,
      cupomAplicado: calculo.cupomAplicado,
    };
  }

  async adicionarItem(usuarioId: string, dto: AddItemCarrinhoDto) {
    if (!/^\d+$/.test(String(dto.idProduto))) {
      throw new BadRequestException(
        `ID de produto inválido: "${dto.idProduto}". Recarregue o catálogo e tente novamente.`,
      );
    }

    const carrinho = await this.getOrCreateCarrinho(usuarioId);

    const produto = await this.produtoRepo.findOneBy({
      idProduto: dto.idProduto,
    });

    if (!produto || produto.status !== 'ativo') {
      throw new NotFoundException(`Produto #${dto.idProduto} não encontrado ou inativo`);
    }

    const itemExistente = await this.itemRepo.findOne({
      where: {
        carrinho: { idCarrinho: carrinho.idCarrinho },
        produto: { idProduto: produto.idProduto },
      },
    });

    const novaQuantidade = itemExistente
      ? itemExistente.quantidade + dto.quantidade
      : dto.quantidade;

    if (novaQuantidade > produto.estoque) {
      throw new BadRequestException(
        `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}`,
      );
    }

    if (itemExistente) {
      itemExistente.quantidade = novaQuantidade;
      itemExistente.precoUnitario = produto.precoVenda;
      await this.itemRepo.save(itemExistente);
    } else {
      const novoItem = this.itemRepo.create({
        carrinho,
        produto,
        quantidade: dto.quantidade,
        precoUnitario: produto.precoVenda,
      });
      await this.itemRepo.save(novoItem);
    }

    return this.obterCarrinho(usuarioId);
  }

  async atualizarQuantidade(
    usuarioId: string,
    idItem: string,
    dto: UpdateItemCarrinhoDto,
  ) {
    const carrinho = await this.getOrCreateCarrinho(usuarioId);

    const item = await this.itemRepo.findOne({
      where: {
        idCarrinhoItem: idItem,
        carrinho: { idCarrinho: carrinho.idCarrinho },
      },
      relations: ['produto'],
    });

    if (!item) {
      throw new NotFoundException(`Item #${idItem} não encontrado no carrinho`);
    }

    if (dto.quantidade === 0) {
      await this.itemRepo.remove(item);
      return this.obterCarrinho(usuarioId);
    }

    if (dto.quantidade > item.produto.estoque) {
      throw new BadRequestException(
        `Estoque insuficiente para "${item.produto.nome}". Disponível: ${item.produto.estoque}`,
      );
    }

    item.quantidade = dto.quantidade;
    item.precoUnitario = item.produto.precoVenda;
    await this.itemRepo.save(item);

    return this.obterCarrinho(usuarioId);
  }

  async removerItem(usuarioId: string, idItem: string) {
    const carrinho = await this.getOrCreateCarrinho(usuarioId);

    const item = await this.itemRepo.findOne({
      where: {
        idCarrinhoItem: idItem,
        carrinho: { idCarrinho: carrinho.idCarrinho },
      },
    });

    if (!item) {
      throw new NotFoundException(`Item #${idItem} não encontrado no carrinho`);
    }

    await this.itemRepo.remove(item);
    return this.obterCarrinho(usuarioId);
  }

  async limparCarrinho(usuarioId: string) {
    const carrinho = await this.getOrCreateCarrinho(usuarioId);
    await this.itemRepo.delete({
      carrinho: { idCarrinho: carrinho.idCarrinho },
    });
    return this.obterCarrinho(usuarioId);
  }
}
