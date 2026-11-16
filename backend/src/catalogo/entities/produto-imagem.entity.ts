import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Produto } from "./produto.entity";

@Entity({name: 'produto_imagem'})
export class ProdutoImagem{
    @PrimaryGeneratedColumn('identity',{name:'id_imagem',type:'bigint'})
    idImagem: string;

    @ManyToOne(() => Produto,produto => produto.imagens,{nullable: false})
    @JoinColumn({name:'id_produto'})
    produto : Produto;

    @Column({name:'url_imagem',type:'text',nullable:false})
    urlImagem: string;

    @Column({ name: 'texto_alternativo', type: 'varchar', length: 255, nullable: true })
    textoAlternativo: string | null;

    @Column({type:'integer',nullable:false,default: 0})
    ordem: number;

    @Column({name:'imagem_principal',type:'boolean',nullable:false,default:false})
    imagemPrincipal: boolean;
}