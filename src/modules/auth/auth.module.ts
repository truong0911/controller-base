import { JwtStrategy } from "@module/auth/common/jwt.strategy";
import { AuthMongoRepository } from "@module/auth/repository/auth-mongo.repository";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { MongoTransaction } from "@module/repository/mongo/mongo.transaction";
import { UserMongoRepository } from "@module/user/repository/user-mongo.repository";
import { UserModule } from "@module/user/user.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthPublicController } from "./auth-public.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [JwtModule.register({}), UserModule],
    providers: [
        AuthService,
        RepositoryProvider(Entity.AUTH, AuthMongoRepository),
        RepositoryProvider(Entity.USER, UserMongoRepository),
        TransactionProvider(MongoTransaction),
        JwtStrategy,
    ],
    controllers: [AuthPublicController],
})
export class AuthModule {}
