import { QueueName } from "@common/constant";
import { AuthMongoRepository } from "@module/auth/repository/auth-mongo.repository";
import { OneSignalClient } from "@module/one-signal/provider/one-signal-client.provider";
import { OneSignalProcessor } from "@module/one-signal/provider/one-signal.process";
import { OneSignalUserMongoRepository } from "@module/one-signal/repository/one-signal-user-mongo.repository";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { UserTopicMongoRepository } from "@module/topic/repository/user-topic-mongo.repository";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { OneSignalController } from "./one-signal.controller";
import { OneSignalService } from "./one-signal.service";

@Module({
    imports: [BullModule.registerQueue({ name: QueueName.ONE_SIGNAL })],
    providers: [
        OneSignalService,
        OneSignalClient,
        OneSignalProcessor,
        RepositoryProvider(
            Entity.ONE_SIGNAL_USER,
            OneSignalUserMongoRepository,
        ),
        RepositoryProvider(Entity.USER_TOPIC, UserTopicMongoRepository),
        RepositoryProvider(Entity.AUTH, AuthMongoRepository),
    ],
    controllers: [OneSignalController],
    exports: [OneSignalService],
})
export class OneSignalModule {}
