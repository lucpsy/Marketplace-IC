import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { Categoria } from './entities/categoria.entity';
import { ProdutoImagem } from './entities/produto-imagem.entity';
import { Fornecedor } from '../fornecedor/entities/fornecedor.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/create-categoria.dto';
import { PromocaoService } from '../promo/promo.service';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepo: Repository<Produto>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,

    @InjectRepository(ProdutoImagem)
    private readonly imagemRepo: Repository<ProdutoImagem>,

    @InjectRepository(Fornecedor)
    private readonly fornecedorRepo: Repository<Fornecedor>,

    private readonly promocaoService: PromocaoService,
  ) {}

  /* -------------------------------------------------------- PRODUTOS */

  async findAllProdutos(filtros?: {
    categoriaId?: string;
    fornecedorId?: string;
    busca?: string;
    apenasAtivos?: boolean;
  }) {
    const qb = this.produtoRepo
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.fornecedor', 'fornecedor')
      .leftJoinAndSelect('produto.categorias', 'categoria')
      .leftJoinAndSelect('produto.imagens', 'imagem')
      .orderBy('produto.dataCadastro', 'DESC')
      .addOrderBy('imagem.ordem', 'ASC');

    if (filtros?.apenasAtivos !== false) {
      qb.andWhere('produto.status = :status', { status: 'ativo' });
    }

    if (filtros?.fornecedorId) {
      qb.andWhere('fornecedor.idFornecedor = :fornecedorId', {
        fornecedorId: filtros.fornecedorId,
      });
    }

    if (filtros?.categoriaId) {
      qb.andWhere('categoria.idCategoria = :categoriaId', {
        categoriaId: filtros.categoriaId,
      });
    }

    if (filtros?.busca) {
      qb.andWhere(
        '(LOWER(produto.nome) LIKE LOWER(:busca) OR LOWER(produto.descricao) LIKE LOWER(:busca))',
        { busca: `%${filtros.busca}%` },
      );
    }

    const produtos = await qb.getMany();
    return this.promocaoService.enriquecerProdutosComPromocao(produtos);
  }

  private async findOneProdutoEntity(id: string): Promise<Produto> {
    const produto = await this.produtoRepo
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.fornecedor', 'fornecedor')
      .leftJoinAndSelect('produto.categorias', 'categoria')
      .leftJoinAndSelect('produto.imagens', 'imagem')
      .where('produto.idProduto = :id', { id })
      .orderBy('imagem.ordem', 'ASC')
      .getOne();

    if (!produto) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }

    return produto;
  }

  async findOneProduto(id: string) {
    const produto = await this.findOneProdutoEntity(id);
    const [enriquecido] =
      await this.promocaoService.enriquecerProdutosComPromocao([produto]);
    return enriquecido;
  }

  async createProduto(dto: CreateProdutoDto) {
    const fornecedor = await this.fornecedorRepo.findOneBy({
      idFornecedor: dto.idFornecedor,
    });

    if (!fornecedor) {
      throw new NotFoundException(
        `Fornecedor #${dto.idFornecedor} não encontrado`,
      );
    }

    let categorias: Categoria[] = [];
    if (dto.categoriaIds && dto.categoriaIds.length > 0) {
      categorias = await this.categoriaRepo.findBy({
        idCategoria: In(dto.categoriaIds),
      });
    }

    const produto = this.produtoRepo.create({
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      marca: dto.marca ?? null,
      selo: dto.selo ?? null,
      sku: dto.sku ?? `SKU-${Date.now()}`,
      precoCusto: String(dto.precoCusto),
      precoVenda: String(dto.precoVenda),
      estoque: dto.estoque ?? 0,
      fornecedor,
      categorias,
    });

    const produtoSalvo = await this.produtoRepo.save(produto);

    if (dto.imagens && dto.imagens.length > 0) {
      const imagens = dto.imagens.map((img, idx) =>
        this.imagemRepo.create({
          urlImagem: img.urlImagem,
          textoAlternativo: img.textoAlternativo ?? null,
          ordem: img.ordem ?? idx,
          imagemPrincipal: img.imagemPrincipal ?? idx === 0,
          produto: produtoSalvo,
        }),
      );
      await this.imagemRepo.save(imagens);
    }

    return this.findOneProduto(produtoSalvo.idProduto);
  }

  async updateProduto(id: string, dto: UpdateProdutoDto) {
    const produto = await this.findOneProdutoEntity(id);

    if (dto.idFornecedor) {
      const fornecedor = await this.fornecedorRepo.findOneBy({
        idFornecedor: dto.idFornecedor,
      });
      if (!fornecedor) {
        throw new NotFoundException(
          `Fornecedor #${dto.idFornecedor} não encontrado`,
        );
      }
      produto.fornecedor = fornecedor;
    }

    if (dto.categoriaIds) {
      produto.categorias = await this.categoriaRepo.findBy({
        idCategoria: In(dto.categoriaIds),
      });
    }

    if (dto.nome !== undefined) produto.nome = dto.nome;
    if (dto.descricao !== undefined) produto.descricao = dto.descricao;
    if (dto.marca !== undefined) produto.marca = dto.marca;
    if (dto.selo !== undefined) produto.selo = dto.selo;
    if (dto.sku !== undefined) produto.sku = dto.sku;
    if (dto.precoCusto !== undefined) produto.precoCusto = String(dto.precoCusto);
    if (dto.precoVenda !== undefined) produto.precoVenda = String(dto.precoVenda);
    if (dto.estoque !== undefined) produto.estoque = dto.estoque;
    if (dto.status !== undefined) produto.status = dto.status;

    await this.produtoRepo.save(produto);

    if (dto.imagens) {
      // Remove imagens antigas e recadastra
      await this.imagemRepo.delete({ produto: { idProduto: id } });
      const novasImagens = dto.imagens.map((img, idx) =>
        this.imagemRepo.create({
          urlImagem: img.urlImagem,
          textoAlternativo: img.textoAlternativo ?? null,
          ordem: img.ordem ?? idx,
          imagemPrincipal: img.imagemPrincipal ?? idx === 0,
          produto,
        }),
      );
      await this.imagemRepo.save(novasImagens);
    }

    return this.findOneProduto(id);
  }

  async removeProduto(id: string) {
    const produto = await this.findOneProdutoEntity(id);
    produto.status = 'inativo';
    await this.produtoRepo.save(produto);
    return { message: `Produto #${id} desativado com sucesso` };
  }

  /* -------------------------------------------------------- CATEGORIAS */

  async findAllCategorias() {
    return this.categoriaRepo.find({
      where: { ativo: true },
      relations: ['subcategorias'],
      order: { nome: 'ASC' },
    });
  }

  async findOneCategoria(id: string) {
    const categoria = await this.categoriaRepo.findOne({
      where: { idCategoria: id },
      relations: ['subcategorias', 'produtos'],
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria #${id} não encontrada`);
    }

    return categoria;
  }

  async createCategoria(dto: CreateCategoriaDto) {
    let categoriaPai: Categoria | null = null;
    if (dto.categoriaPaiId) {
      categoriaPai = await this.categoriaRepo.findOneBy({
        idCategoria: dto.categoriaPaiId,
      });
      if (!categoriaPai) {
        throw new NotFoundException(
          `Categoria pai #${dto.categoriaPaiId} não encontrada`,
        );
      }
    }

    const novaCategoria = this.categoriaRepo.create({
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      categoriaPai,
    });

    return this.categoriaRepo.save(novaCategoria);
  }

  async updateCategoria(id: string, dto: UpdateCategoriaDto) {
    const categoria = await this.findOneCategoria(id);

    if (dto.nome !== undefined) categoria.nome = dto.nome;
    if (dto.descricao !== undefined) categoria.descricao = dto.descricao;
    if (dto.ativo !== undefined) categoria.ativo = dto.ativo;

    return this.categoriaRepo.save(categoria);
  }

  async removeCategoria(id: string) {
    const categoria = await this.findOneCategoria(id);
    categoria.ativo = false;
    await this.categoriaRepo.save(categoria);
    return { message: `Categoria #${id} desativada com sucesso` };
  }
}
