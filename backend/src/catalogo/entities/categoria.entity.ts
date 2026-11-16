import { Produto } from "./produto.entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    ManyToMany
} from "typeorm";

@Entity({ name: 'categoria' })
export class Categoria {
    @PrimaryGeneratedColumn('identity', {
        name: 'id_categoria',
        type: 'bigint'
    })
    idCategoria: string;

    @ManyToOne(() => Categoria, categoria => categoria.subcategorias, {nullable: true})
    @JoinColumn({ name: 'id_categoria_pai' })
    categoriaPai: Categoria | null;

    @OneToMany(() => Categoria, categoria => categoria.categoriaPai)
    subcategorias: Categoria[];

    @Column({ type: 'varchar', length: 120, nullable: false })
    nome: string;

    @Column({ type: 'text', nullable: true })
    descricao: string | null;

    @Column({ type: 'boolean', nullable: false, default: true })
    ativo: boolean;

    @ManyToMany(() => Produto, produto => produto.categorias)
    produtos: Produto[];
}