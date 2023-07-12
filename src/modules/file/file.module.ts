import { FileMongoRepository } from "@module/file/repository/file-mongo.repository";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigService } from "./common/multer-config.service";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { JwtModule } from "@nestjs/jwt";
import { FilePublicController } from "./file-public.controller";

@Module({
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigService,
            inject: [ConfigService],
        }),
        JwtModule.register({}),
    ],
    providers: [
        FileService,
        RepositoryProvider(Entity.FILE, FileMongoRepository),
    ],
    controllers: [FileController, FilePublicController],
})
export class FileModule {}
