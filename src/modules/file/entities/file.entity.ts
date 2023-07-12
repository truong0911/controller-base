import { StrObjectId } from "@common/constant";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";
import { FileStorageType } from "../common/constant";

@Schema({ collection: Entity.FILE })
export class File implements BaseEntity {
    @StrObjectId()
    _id: string;

    @IsString()
    @Prop({ required: true })
    name: string;

    @IsString()
    @Prop({ required: true, ref: Entity.USER })
    author: string;

    @IsString()
    @Prop({ required: true })
    authorName: string;

    @IsString()
    @Prop({ required: true })
    mimetype: string;

    @IsNumber()
    @Prop({ required: true })
    size: number;

    @IsBoolean()
    @Prop({ required: true })
    isPublic: boolean;

    @IsEnum(FileStorageType)
    @Prop({
        required: true,
        type: String,
        enum: Object.values(FileStorageType),
    })
    storageType: FileStorageType;

    @IsString()
    @Prop({ required: true })
    data: string;
}

export const FileSchema = SchemaFactory.createForClass(File);

FileSchema.methods.toJSON = function () {
    const res = this.toObject();
    delete res.data;
    return res;
};
export type FileDocument = HydratedDocument<File>;
