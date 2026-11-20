import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { ProdutoPromocao } from "./produto_promocao.entity";

@Entity({ name: 'promocao' })
export class Promocao {
    @PrimaryGeneratedColumn('identity', {
        name: 'id_promocao',
        type: 'bigint'
    })
    idPromocao: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descricao: string | null;

    @Column({ name: 'tipo_desconto', type: 'varchar', length: 30, nullable: false })
    tipoDesconto: string;

    @Column({
        name: 'valor_desconto',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: false
    })
    valorDesconto: string;

    @Column({ name: 'data_inicio', type: 'timestamp', nullable: false })
    dataInicio: Date;

    @Column({ name: 'data_fim', type: 'timestamp', nullable: false })
    dataFim: Date;

    @Column({ type: 'varchar', length: 30, nullable: true })
    cor: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
    codigo: string | null;

    @Column({
        name: 'valor_minimo',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
    })
    valorMinimo: string | null;

    @Column({
        name: 'quantidade_minima',
        type: 'integer',
        nullable: true,
    })
    quantidadeMinima: number | null;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: false,
        default: 'rascunho'
    })
    status: string;

    @CreateDateColumn({
        name: 'data_cadastro',
        type: 'timestamp',
        nullable: false,
        default: () => 'now()'
    })
    dataCadastro: Date; 

    @OneToMany(() => ProdutoPromocao, pp => pp.promocao)
    produtosPromocao: ProdutoPromocao[];
}
