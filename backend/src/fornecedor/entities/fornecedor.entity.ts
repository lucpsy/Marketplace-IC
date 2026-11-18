import { Produto } from "../../catalogo/entities/produto.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'fornecedor'})
export class Fornecedor{
    @PrimaryGeneratedColumn('identity',{type: 'bigint',name: 'id_fornecedor',})
    idFornecedor: string;
    
    @Column({name:'nome_razao_social',type:'varchar',length: 200,nullable: false})
    nomeRazaoSocial: string;    

    @Column({ name: 'nome_fantasia', type: 'varchar', length: 150, nullable: true })
    nomeFantasia: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    telefone: string | null;

    @Column({ type: 'varchar', length: 30, nullable: false, default: 'pendente' })
    status: string;

    @Column({ name: 'dados_pagamento', type: 'text', nullable: true })
    dadosPagamento: string | null;

    @CreateDateColumn({type:'timestamp',name:'data_cadastro',nullable: false,default: () => 'now()'})
    dataCadastro: Date; 

    @OneToMany(() => Produto, produto => produto.fornecedor)
    produtos: Produto[];
}
