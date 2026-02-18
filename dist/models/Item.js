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
exports.Item = void 0;
const typeorm_1 = require("typeorm");
const Supplier_1 = require("./Supplier");
let Item = class Item {
};
exports.Item = Item;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Item.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Item.prototype, "item_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Item.prototype, "item_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'قطعة' }),
    __metadata("design:type", String)
], Item.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { default: 0 }),
    __metadata("design:type", Number)
], Item.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { default: 0 }),
    __metadata("design:type", Number)
], Item.prototype, "min_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: true }),
    __metadata("design:type", Number)
], Item.prototype, "max_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Item.prototype, "cost_price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Item.prototype, "selling_price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, { nullable: true }),
    __metadata("design:type", Supplier_1.Supplier)
], Item.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Item.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Item.prototype, "updated_at", void 0);
exports.Item = Item = __decorate([
    (0, typeorm_1.Entity)()
], Item);
