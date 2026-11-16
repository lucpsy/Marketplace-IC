import { Fornecedor } from "../../fornecedor/entities/fornecedor.entity";
import { ProdutoImagem } from "./produto-imagem.entity";
import { Categoria } from "./categoria.entity";
import { ProdutoPromocao } from "../../promo/entities/produto_promocao.entity";
import { CarrinhoItem } from "../../carrinho/entities/carrinho-item.entity";
import { ItemPedido } from "../../pedido/entities/item_pedido.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,ManyToMany,JoinTable} from "typeorm";

@Entity({ name: "produto" })
export class Produto {
  @PrimaryGeneratedColumn("identity", {name: "id_produto",type: "bigint"})
  idProduto: string;

  @ManyToOne(() => Fornecedor, fornecedor => fornecedor.produtos,{nullable: false})
  @JoinColumn({ name: "id_fornecedor" })
  fornecedor: Fornecedor;

  @Column({type:'varchar',length:200,nullable:false})
  nome:string

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  selo: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string | null;

  @Column({ name: 'preco_custo', type: 'decimal', precision: 12, scale: 2, nullable: false })
  precoCusto: string;

  @Column({ name: 'preco_venda', type: 'decimal', precision: 12, scale: 2, nullable: false })
  precoVenda: string;

  @Column({ type: 'integer', nullable: false, default: 0 })
  estoque: number;

  @Column({ type: 'varchar', length: 30, nullable: false, default: 'ativo' })
  status: string;

  @CreateDateColumn({ type: 'timestamp', name: 'data_cadastro', nullable: false, default: () => 'now()' })
  dataCadastro: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'data_atualizacao', nullable: true })
  dataAtualizacao: Date | null;

  @OneToMany(() => ProdutoImagem,produtoimagem => produtoimagem.produto)
  imagens : ProdutoImagem[];

  @ManyToMany(() => Categoria, categoria => categoria.produtos)
  @JoinTable({name: 'produto_categoria',
    joinColumn: {
          name: 'id_produto',
          referencedColumnName: 'idProduto'
      },
      inverseJoinColumn: {
          name: 'id_categoria',
          referencedColumnName: 'idCategoria'
      }
  })  
  categorias: Categoria[];

  @OneToMany(() => ProdutoPromocao, pp => pp.produto)
  promocoes: ProdutoPromocao[];

  @OneToMany(() => CarrinhoItem, item => item.produto)
  itensCarrinho: CarrinhoItem[];

  @OneToMany(() => ItemPedido, item => item.produto)
  itensPedido: ItemPedido[];
}
