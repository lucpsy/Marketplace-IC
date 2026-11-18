import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn, 
    Unique
} from "typeorm";

import { Produto } from "../../catalogo/entities/produto.entity";
import { Promocao } from "./promocao.entity";

@Entity({ name: 'produto_promocao' })
@Unique(['promocao','produto'])
export class ProdutoPromocao {
    @PrimaryGeneratedColumn('identity', {
        name: 'id_produto_promocao',
        type: 'bigint'
    })
    idProdutoPromocao: string;

    @ManyToOne(() => Promocao, promocao => promocao.produtosPromocao, {
        nullable: false
    })
    @JoinColumn({ name: 'id_promocao' })
    promocao: Promocao;

    @ManyToOne(() => Produto, produto => produto.promocoes, {
        nullable: false
    })
    @JoinColumn({ name: 'id_produto' })
    produto: Produto;
}

