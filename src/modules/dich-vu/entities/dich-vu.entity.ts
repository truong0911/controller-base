import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";
import { MenhGia } from "../common/contants";

@Schema({
    collection: Entity.DICH_VU,
    timestamps: true,
})
export class DichVu implements BaseEntity {
    @StrObjectId()
    _id: string;

    @IsString({ message: "Tên dịch vụ phải là xâu ký tự" })
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Tên  dịch vụ" })
    ten: string;

    @IsString({ message: "Mô tả là xâu ký tự" })
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả" })
    moTa?: string;

    @IsNumber()
    @Prop()
    @EntityDefinition.field({ label: "Giá tiền" })
    giaTien: number;

    @IsEnum(MenhGia)
    @IsString()
    @Prop({ type: String, enum: Object.values(MenhGia) })
    @EntityDefinition.field({ label: "Mệnh giá" })
    menhGia: string;
}

export type DichVuDocument = HydratedDocument<DichVu>;
export const DichVuSchema = SchemaFactory.createForClass(DichVu);
