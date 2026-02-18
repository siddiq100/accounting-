"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const Customer_1 = require("./Customer");
const Supplier_1 = require("./Supplier");
const Transaction_1 = require("./Transaction");
let Account = class Account {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Account.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer, customer => customer.accounts, { nullable: true }),
    __metadata("design:type", Customer_1.Customer)
], Account.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, supplier => supplier.accounts, { nullable: true }),
    __metadata("design:type", Supplier_1.Supplier)
], Account.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Transaction_1.Transaction, transaction => transaction.account),
    __metadata("design:type", Array)
], Account.prototype, "transactions", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)()
], Account);
