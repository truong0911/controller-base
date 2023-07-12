import { MongoRepository } from "@module/repository/mongo/mongo.repository";
import { DichVu } from "../entities/dich-vu.entity";
import { DichVuRepository } from "./dich-vu-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Entity } from "@module/repository";
import { Model } from "mongoose";

export class DichVuMongoRepository
    extends MongoRepository<DichVu>
    implements DichVuRepository
{
    constructor(
        @InjectModel(Entity.DICH_VU)
        private readonly dichVuModel: Model<DichVu>,
    ) {
        super(dichVuModel);
    }
    getMe(dichVu: DichVu): Promise<DichVu> {
        return this.dichVuModel.findOne({ ten: dichVu.ten }).exec();
    }
}
