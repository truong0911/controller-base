import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { MongoTransaction } from "@module/repository/mongo/mongo.transaction";
import { UserMongoRepository } from "@module/user/repository/user-mongo.repository";
import { Module } from "@nestjs/common";
import { UserImportController } from "./controller/user-import.controller";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { UserImportService } from "./service/user-import.service";

@Module({
    controllers: [UserController, UserImportController],
    providers: [
        UserService,
        UserImportService,
        RepositoryProvider(Entity.USER, UserMongoRepository),
        TransactionProvider(MongoTransaction),
    ],
    exports: [UserService],
})
export class UserModule {}
