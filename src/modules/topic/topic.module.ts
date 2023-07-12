import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TopicMongoRepository } from "@module/topic/repository/topic-mongo.repository";
import { UserTopicMongoRepository } from "@module/topic/repository/user-topic-mongo.repository";
import { Module } from "@nestjs/common";
import { TopicService } from "./topic.service";

@Module({
    providers: [
        TopicService,
        RepositoryProvider(Entity.TOPIC, TopicMongoRepository),
        RepositoryProvider(Entity.USER_TOPIC, UserTopicMongoRepository),
    ],
})
export class TopicModule {}
