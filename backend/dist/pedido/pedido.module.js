"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pedido_service_1 = require("./pedido.service");
const pedido_controller_1 = require("./pedido.controller");
const pedido_entity_1 = require("./entities/pedido.entity");
const item_pedido_entity_1 = require("./entities/item_pedido.entity");
const status_pedido_entity_1 = require("./entities/status_pedido.entity");
const transicao_status_entity_1 = require("./entities/transicao-status.entity");
const historico_status_entity_1 = require("./entities/historico-status.entity");
const carrinho_entity_1 = require("../carrinho/entities/carrinho.entity");
const carrinho_item_entity_1 = require("../carrinho/entities/carrinho-item.entity");
const produto_entity_1 = require("../catalogo/entities/produto.entity");
const usuario_entity_1 = require("../usuario/entities/usuario.entity");
let PedidoModule = class PedidoModule {
};
exports.PedidoModule = PedidoModule;
exports.PedidoModule = PedidoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                pedido_entity_1.Pedido,
                item_pedido_entity_1.ItemPedido,
                status_pedido_entity_1.StatusPedido,
                transicao_status_entity_1.TransicaoStatus,
                historico_status_entity_1.HistoricoStatus,
                carrinho_entity_1.Carrinho,
                carrinho_item_entity_1.CarrinhoItem,
                produto_entity_1.Produto,
                usuario_entity_1.Usuario,
            ]),
        ],
        controllers: [pedido_controller_1.PedidoController],
        providers: [pedido_service_1.PedidoService],
        exports: [pedido_service_1.PedidoService],
    })
], PedidoModule);
//# sourceMappingURL=pedido.module.js.map