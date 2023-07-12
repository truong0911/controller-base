import { StrObjectId } from "@common/constant";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { IncrementName } from "../common/constant";

@Schema({ collection: Entity.INCREMENT })
export class Increment implements BaseEntity {
    @StrObjectId()
    _id: string;

    @Prop({ required: true, unique: true, enum: Object.values(IncrementName) })
    name: IncrementName;

    @Prop({ required: true, default: () => 0 })
    count: number;
}

export type IncrementDocument = HydratedDocument<Increment>;
export const IncrementSchema = SchemaFactory.createForClass(Increment);
