import { NotificationMongoRepository } from "@module/notification/repository/notification-mongo.repository";
import { OneSignalModule } from "@module/one-signal/one-signal.module";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";

@Module({
    imports: [OneSignalModule],
    providers: [
        NotificationService,
        RepositoryProvider(Entity.NOTIFICATION, NotificationMongoRepository),
    ],
    controllers: [NotificationController],
})
export class NotificationModule {}
