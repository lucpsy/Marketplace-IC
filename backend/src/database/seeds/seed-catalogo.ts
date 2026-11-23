import { DataSource } from "typeorm";
import { Fornecedor } from "../../fornecedor/entities/fornecedor.entity";
import { Categoria } from "../../catalogo/entities/categoria.entity";
import { Produto } from "../../catalogo/entities/produto.entity";
import { ProdutoImagem } from "../../catalogo/entities/produto-imagem.entity";

export async function seedCatalogo(dataSource: DataSource) {
  const fornecedorRepo = dataSource.getRepository(Fornecedor);
  const categoriaRepo = dataSource.getRepository(Categoria);
  const produtoRepo = dataSource.getRepository(Produto);
  const imagemRepo = dataSource.getRepository(ProdutoImagem);

  // Evita duplicar se já existirem produtos no banco
  const count = await produtoRepo.count();
  if (count > 0) return;

  // 1. Cria Fornecedores
  const fornMap = new Map<string, Fornecedor>();
  const fornecedoresData = [
    {
      key: "confeccoes-ic",
      nome: "Confecções IC",
      email: "confeccoes@diacom.ic.ufal.br",
    },
    {
      key: "grafica-campus",
      nome: "Gráfica Campus",
      email: "grafica@campus.ufal.br",
    },
    { key: "brindes-ufal", nome: "Brindes UFAL", email: "brindes@ufal.br" },
  ];

  for (const f of fornecedoresData) {
    let entity = await fornecedorRepo.findOneBy({ nomeRazaoSocial: f.nome });
    if (!entity) {
      entity = fornecedorRepo.create({
        nomeRazaoSocial: f.nome,
        nomeFantasia: f.nome,
        email: f.email,
        status: "ativo",
      });
      entity = await fornecedorRepo.save(entity);
    }
    fornMap.set(f.key, entity);
  }

  // 2. Cria Categorias
  const catMap = new Map<string, Categoria>();
  for (const nomeCat of ["Vestuário", "Acessórios", "Papelaria"]) {
    let cat = await categoriaRepo.findOneBy({ nome: nomeCat });
    if (!cat) {
      cat = categoriaRepo.create({
        nome: nomeCat,
        ativo: true,
      } as Partial<Categoria>);
      cat = await categoriaRepo.save(cat);
    }
    catMap.set(nomeCat, cat);
  }

  // 3. Cria Produtos e Imagens
  const produtosData = [
    {
      sku: "camisa-diacom",
      nome: "Camisa DIACOM 2026",
      categoria: "Vestuário",
      fornecedorKey: "confeccoes-ic",
      precoCusto: "30.00",
      precoVenda: "55.00",
      estoque: 42,
      selo: "Mais vendido",
      descricao:
        "Malha premium, estampa serigrafada com o brasão do Instituto de Computação.",
      imagens: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop&auto=format",
      ],
    },
    {
      sku: "moletom-ic",
      nome: "Moletom IC+ Canguru",
      categoria: "Vestuário",
      fornecedorKey: "confeccoes-ic",
      precoCusto: "75.00",
      precoVenda: "129.00",
      estoque: 18,
      selo: "Edição limitada",
      descricao:
        "Flanelado interno, capuz forrado e bolso canguru. Aguenta o ar-condicionado do LabII.",
      imagens: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1614495039153-2f8c68e57bab?w=800&h=800&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=800&fit=crop&auto=format",
      ],
    },
    {
      sku: "caneca-compila",
      nome: 'Caneca "Compila na Primeira"',
      categoria: "Acessórios",
      fornecedorKey: "brindes-ufal",
      precoCusto: "18.00",
      precoVenda: "39.00",
      estoque: 60,
      selo: null,
      descricao:
        "Porcelana 330ml. Para o café que sustenta as madrugadas de entrega.",
      imagens: [
        "https://i.pinimg.com/736x/f9/df/7a/f9df7a3eed23b730b2d63063b954eeca.jpg",
      ],
    },
    {
      sku: "ecobag-diacom",
      nome: "Ecobag DIACOM",
      categoria: "Acessórios",
      fornecedorKey: "brindes-ufal",
      precoCusto: "15.00",
      precoVenda: "32.00",
      estoque: 55,
      selo: null,
      descricao:
        "Algodão cru reforçado, ideal para carregar notebook e cadernos no campus.",
      imagens: [
        "https://i.pinimg.com/736x/8c/08/e6/8c08e679951ebcd33028dc14e5726d33.jpg",
      ],
    },
  ];

  for (const p of produtosData) {
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
      status: "ativo",
      fornecedor,
      categorias: categoria ? [categoria] : [],
    });

    const salvo = await produtoRepo.save(produto);

    for (let i = 0; i < p.imagens.length; i++) {
      const img = imagemRepo.create({
        produto: salvo,
        urlImagem: p.imagens[i],
        ordem: i,
        imagemPrincipal: i === 0,
      } as Partial<ProdutoImagem>);
      await imagemRepo.save(img);
    }
  }
}
