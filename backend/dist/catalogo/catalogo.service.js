"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const produto_entity_1 = require("./entities/produto.entity");
const categoria_entity_1 = require("./entities/categoria.entity");
const produto_imagem_entity_1 = require("./entities/produto-imagem.entity");
const fornecedor_entity_1 = require("../fornecedor/entities/fornecedor.entity");
const promo_service_1 = require("../promo/promo.service");
let CatalogoService = class CatalogoService {
    constructor(produtoRepo, categoriaRepo, imagemRepo, fornecedorRepo, promocaoService) {
        this.produtoRepo = produtoRepo;
        this.categoriaRepo = categoriaRepo;
        this.imagemRepo = imagemRepo;
        this.fornecedorRepo = fornecedorRepo;
        this.promocaoService = promocaoService;
    }
    async findAllProdutos(filtros) {
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
            qb.andWhere('(LOWER(produto.nome) LIKE LOWER(:busca) OR LOWER(produto.descricao) LIKE LOWER(:busca))', { busca: `%${filtros.busca}%` });
        }
        const produtos = await qb.getMany();
        return this.promocaoService.enriquecerProdutosComPromocao(produtos);
    }
    async findOneProdutoEntity(id) {
        const produto = await this.produtoRepo
            .createQueryBuilder('produto')
            .leftJoinAndSelect('produto.fornecedor', 'fornecedor')
            .leftJoinAndSelect('produto.categorias', 'categoria')
            .leftJoinAndSelect('produto.imagens', 'imagem')
            .where('produto.idProduto = :id', { id })
            .orderBy('imagem.ordem', 'ASC')
            .getOne();
        if (!produto) {
            throw new common_1.NotFoundException(`Produto #${id} não encontrado`);
        }
        return produto;
    }
    async findOneProduto(id) {
        const produto = await this.findOneProdutoEntity(id);
        const [enriquecido] = await this.promocaoService.enriquecerProdutosComPromocao([produto]);
        return enriquecido;
    }
    async createProduto(dto) {
        const fornecedor = await this.fornecedorRepo.findOneBy({
            idFornecedor: dto.idFornecedor,
        });
        if (!fornecedor) {
            throw new common_1.NotFoundException(`Fornecedor #${dto.idFornecedor} não encontrado`);
        }
        let categorias = [];
        if (dto.categoriaIds && dto.categoriaIds.length > 0) {
            categorias = await this.categoriaRepo.findBy({
                idCategoria: (0, typeorm_2.In)(dto.categoriaIds),
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
            const imagens = dto.imagens.map((img, idx) => this.imagemRepo.create({
                urlImagem: img.urlImagem,
                textoAlternativo: img.textoAlternativo ?? null,
                ordem: img.ordem ?? idx,
                imagemPrincipal: img.imagemPrincipal ?? idx === 0,
                produto: produtoSalvo,
            }));
            await this.imagemRepo.save(imagens);
        }
        return this.findOneProduto(produtoSalvo.idProduto);
    }
    async updateProduto(id, dto) {
        const produto = await this.findOneProdutoEntity(id);
        if (dto.idFornecedor) {
            const fornecedor = await this.fornecedorRepo.findOneBy({
                idFornecedor: dto.idFornecedor,
            });
            if (!fornecedor) {
                throw new common_1.NotFoundException(`Fornecedor #${dto.idFornecedor} não encontrado`);
            }
            produto.fornecedor = fornecedor;
        }
        if (dto.categoriaIds) {
            produto.categorias = await this.categoriaRepo.findBy({
                idCategoria: (0, typeorm_2.In)(dto.categoriaIds),
            });
        }
        if (dto.nome !== undefined)
            produto.nome = dto.nome;
        if (dto.descricao !== undefined)
            produto.descricao = dto.descricao;
        if (dto.marca !== undefined)
            produto.marca = dto.marca;
        if (dto.selo !== undefined)
            produto.selo = dto.selo;
        if (dto.sku !== undefined)
            produto.sku = dto.sku;
        if (dto.precoCusto !== undefined)
            produto.precoCusto = String(dto.precoCusto);
        if (dto.precoVenda !== undefined)
            produto.precoVenda = String(dto.precoVenda);
        if (dto.estoque !== undefined)
            produto.estoque = dto.estoque;
        if (dto.status !== undefined)
            produto.status = dto.status;
        await this.produtoRepo.save(produto);
        if (dto.imagens) {
            await this.imagemRepo.delete({ produto: { idProduto: id } });
            const novasImagens = dto.imagens.map((img, idx) => this.imagemRepo.create({
                urlImagem: img.urlImagem,
                textoAlternativo: img.textoAlternativo ?? null,
                ordem: img.ordem ?? idx,
                imagemPrincipal: img.imagemPrincipal ?? idx === 0,
                produto,
            }));
            await this.imagemRepo.save(novasImagens);
        }
        return this.findOneProduto(id);
    }
    async removeProduto(id) {
        const produto = await this.findOneProdutoEntity(id);
        produto.status = 'inativo';
        await this.produtoRepo.save(produto);
        return { message: `Produto #${id} desativado com sucesso` };
    }
    async findAllCategorias() {
        return this.categoriaRepo.find({
            where: { ativo: true },
            relations: ['subcategorias'],
            order: { nome: 'ASC' },
        });
    }
    async findOneCategoria(id) {
        const categoria = await this.categoriaRepo.findOne({
            where: { idCategoria: id },
            relations: ['subcategorias', 'produtos'],
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoria #${id} não encontrada`);
        }
        return categoria;
    }
    async createCategoria(dto) {
        let categoriaPai = null;
        if (dto.categoriaPaiId) {
            categoriaPai = await this.categoriaRepo.findOneBy({
                idCategoria: dto.categoriaPaiId,
            });
            if (!categoriaPai) {
                throw new common_1.NotFoundException(`Categoria pai #${dto.categoriaPaiId} não encontrada`);
            }
        }
        const novaCategoria = this.categoriaRepo.create({
            nome: dto.nome,
            descricao: dto.descricao ?? null,
            categoriaPai,
        });
        return this.categoriaRepo.save(novaCategoria);
    }
    async updateCategoria(id, dto) {
        const categoria = await this.findOneCategoria(id);
        if (dto.nome !== undefined)
            categoria.nome = dto.nome;
        if (dto.descricao !== undefined)
            categoria.descricao = dto.descricao;
        if (dto.ativo !== undefined)
            categoria.ativo = dto.ativo;
        return this.categoriaRepo.save(categoria);
    }
    async removeCategoria(id) {
        const categoria = await this.findOneCategoria(id);
        categoria.ativo = false;
        await this.categoriaRepo.save(categoria);
        return { message: `Categoria #${id} desativada com sucesso` };
    }
};
exports.CatalogoService = CatalogoService;
exports.CatalogoService = CatalogoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(produto_entity_1.Produto)),
    __param(1, (0, typeorm_1.InjectRepository)(categoria_entity_1.Categoria)),
    __param(2, (0, typeorm_1.InjectRepository)(produto_imagem_entity_1.ProdutoImagem)),
    __param(3, (0, typeorm_1.InjectRepository)(fornecedor_entity_1.Fornecedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        promo_service_1.PromocaoService])
], CatalogoService);
//# sourceMappingURL=catalogo.service.js.map