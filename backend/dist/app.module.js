"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const usuario_module_1 = require("./usuario/usuario.module");
const promo_module_1 = require("./promo/promo.module");
const pedido_module_1 = require("./pedido/pedido.module");
const pagamento_module_1 = require("./pagamento/pagamento.module");
const notificacao_module_1 = require("./notificacao/notificacao.module");
const fornecedor_module_1 = require("./fornecedor/fornecedor.module");
const catalogo_module_1 = require("./catalogo/catalogo.module");
const carrinho_module_1 = require("./carrinho/carrinho.module");
const auditoria_module_1 = require("./auditoria/auditoria.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'postgres',
                port: 5432,
                username: 'marketplace',
                password: 'marketplace',
                database: 'marketplace',
                autoLoadEntities: true,
                synchronize: false,
            }),
            usuario_module_1.UsuarioModule,
            promo_module_1.PromocaoModule,
            pedido_module_1.PedidoModule,
            pagamento_module_1.PagamentoModule,
            notificacao_module_1.NotificacaoModule,
            fornecedor_module_1.FornecedorModule,
            catalogo_module_1.CatalogoModule,
            carrinho_module_1.CarrinhoModule,
            auditoria_module_1.AuditoriaModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map