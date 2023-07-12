import { Module } from "@nestjs/common";
import { DichVuService } from "./service/dich-vu.service";
import { DichVuController } from "./controller/dich-vu.controller";
import { MongoTransaction } from "@module/repository/mongo/mongo.transaction";
import { RepositoryProvider } from "@module/repository/common/repository";
import { DichVuMongoRepository } from "./repository/dich-vu-mongo.repository";
import { Entity } from "@module/repository";
import { TransactionProvider } from "@module/repository/common/transaction";

@Module({
    providers: [
        DichVuService,
        RepositoryProvider(Entity.DICH_VU, DichVuMongoRepository),
        TransactionProvider(MongoTransaction),
    ],
    controllers: [DichVuController],
})
export class DichVuModule {}
