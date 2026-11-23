import 'dotenv/config';
import { DataSource } from 'typeorm';
import AppDataSource from '../data-source';
import { Fornecedor } from '../../fornecedor/entities/fornecedor.entity';
import { Categoria } from '../../catalogo/entities/categoria.entity';
import { Produto } from '../../catalogo/entities/produto.entity';
import { ProdutoImagem } from '../../catalogo/entities/produto-imagem.entity';

/**
 * Função responsável pela criação das categorias e produtos iniciais do catálogo.
 * Pode receber um DataSource existente (do NestJS) ou usar o AppDataSource diretamente (via CLI).
 */
export async function seedCatalogo(ds?: DataSource) {
  let dataSource = ds;
  let initializedHere = false;

  if (!dataSource) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      initializedHere = true;
    }
    dataSource = AppDataSource;
  }

  const fornecedorRepo = dataSource.getRepository(Fornecedor);
  const categoriaRepo = dataSource.getRepository(Categoria);
  const produtoRepo = dataSource.getRepository(Produto);
  const imagemRepo = dataSource.getRepository(ProdutoImagem);

  const count = await produtoRepo.count();
  if (count > 0) {
    console.log(
      `[Seed] Catálogo já possui ${count} produto(s). Nenhuma ação necessária.`,
    );
    if (initializedHere) {
      await dataSource.destroy();
    }
    return;
  }

  // 1. Garante Fornecedores (reutilizando os já criados pelo seed-fornecedores)
  const fornMap = new Map<string, Fornecedor>();
  const fornecedoresData = [
    {
      key: 'confeccoes-ic',
      nomeRazaoSocial: 'Confecções IC Ltda',
      nomeFantasia: 'Confecções IC',
      email: 'confeccoes@diacom.ic.ufal.br',
    },
    {
      key: 'grafica-campus',
      nomeRazaoSocial: 'Gráfica Universitária Campus Ltda',
      nomeFantasia: 'Gráfica Campus',
      email: 'grafica@campus.ufal.br',
    },
    {
      key: 'brindes-ufal',
      nomeRazaoSocial: 'Brindes Alagoas Eireli',
      nomeFantasia: 'Brindes Alagoas',
      email: 'contato@brindesalagoas.com.br',
    },
  ];

  for (const f of fornecedoresData) {
    let entity = await fornecedorRepo.findOne({
      where: [
        { nomeFantasia: f.nomeFantasia },
        { nomeRazaoSocial: f.nomeRazaoSocial },
        { email: f.email },
      ],
    });

    if (!entity) {
      entity = fornecedorRepo.create({
        nomeRazaoSocial: f.nomeRazaoSocial,
        nomeFantasia: f.nomeFantasia,
        email: f.email,
        status: 'ativo',
      });
      entity = await fornecedorRepo.save(entity);
    }

    fornMap.set(f.key, entity);
  }

  // 2. Garante Categorias
  const catMap = new Map<string, Categoria>();
  for (const nomeCat of ['Vestuário', 'Acessórios', 'Papelaria']) {
    let cat = await categoriaRepo.findOneBy({ nome: nomeCat });
    if (!cat) {
      cat = categoriaRepo.create({
        nome: nomeCat,
        ativo: true,
      });
      cat = await categoriaRepo.save(cat);
    }
    catMap.set(nomeCat, cat);
  }

  // 3. Cria Produtos e Imagens
  const produtosData = [
    {
      sku: 'camisa-diacom',
      nome: 'Camisa DIACOM 2026',
      categoria: 'Vestuário',
      fornecedorKey: 'confeccoes-ic',
      precoCusto: '30.00',
      precoVenda: '55.00',
      estoque: 42,
      selo: 'Mais vendido',
      descricao:
        'Malha premium, estampa serigrafada com o brasão do Instituto de Computação.',
      imagens: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop&auto=format',
      ],
    },
    {
      sku: 'moletom-ic',
      nome: 'Moletom IC+ Canguru',
      categoria: 'Vestuário',
      fornecedorKey: 'confeccoes-ic',
      precoCusto: '75.00',
      precoVenda: '129.00',
      estoque: 18,
      selo: 'Edição limitada',
      descricao:
        'Flanelado interno, capuz forrado e bolso canguru. Aguenta o ar-condicionado do LabII.',
      imagens: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1614495039153-2f8c68e57bab?w=800&h=800&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=800&fit=crop&auto=format',
      ],
    },
    {
      sku: 'caneca-compila',
      nome: 'Caneca "Compila na Primeira"',
      categoria: 'Acessórios',
      fornecedorKey: 'brindes-ufal',
      precoCusto: '18.00',
      precoVenda: '39.00',
      estoque: 60,
      selo: null,
      descricao:
        'Porcelana 330ml. Para o café que sustenta as madrugadas de entrega.',
      imagens: [
        'https://i.pinimg.com/736x/f9/df/7a/f9df7a3eed23b730b2d63063b954eeca.jpg',
      ],
    },
    {
      sku: 'ecobag-diacom',
      nome: 'Ecobag DIACOM',
      categoria: 'Acessórios',
      fornecedorKey: 'brindes-ufal',
      precoCusto: '15.00',
      precoVenda: '32.00',
      estoque: 55,
      selo: null,
      descricao:
        'Algodão cru reforçado, ideal para carregar notebook e cadernos no campus.',
      imagens: [
        'https://i.pinimg.com/736x/8c/08/e6/8c08e679951ebcd33028dc14e5726d33.jpg',
      ],
    },
  ];

  for (const p of produtosData) {
    const existente = await produtoRepo.findOneBy({ sku: p.sku });
    if (existente) continue;

    const fornecedor = fornMap.get(p.fornecedorKey)!;
    const categoria = catMap.get(p.categoria);

    const produto = produtoRepo.create({
      sku: p.sku,
      nome: p.nome,
      descricao: p.descricao,
      selo: p.selo,
      precoCusto: p.precoCusto,
      precoVenda: p.precoVenda,
      estoque: p.estoque,
      status: 'ativo',
      fornecedor,
      categorias: categoria ? [categoria] : [],
    });

    const salvo = await produtoRepo.save(produto);

    const imagens = p.imagens.map((urlImagem, i) =>
      imagemRepo.create({
        produto: salvo,
        urlImagem,
        ordem: i,
        imagemPrincipal: i === 0,
      }),
    );
    await imagemRepo.save(imagens);
  }

  console.log('[Seed] Catálogo inicial criado com sucesso!');

  if (initializedHere) {
    await dataSource.destroy();
  }
}

// Execução direta via CLI (npm run seed:catalogo)
if (require.main === module) {
  seedCatalogo().catch((err) => {
    console.error('[Seed] Erro ao executar seed de catálogo:', err);
    process.exit(1);
  });
}
