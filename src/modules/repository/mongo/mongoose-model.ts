import { DichVuSchema } from "@module/dich-vu/entities/dich-vu.entity";
import { FileSchema } from "@module/file/entities/file.entity";
import { ImportSessionSchema } from "@module/import-session/entities/import-session.entity";
import { IncrementSchema } from "@module/increment/entities/increment.entity";
import { NotificationSchema } from "@module/notification/entities/notification.entity";
import { OneSignalUserSchema } from "@module/one-signal/entities/one-signal-user.entity";
import { SettingSchema } from "@module/setting/entities/setting.entity";
import { TopicSchema } from "@module/topic/entities/topic.entity";
import { UserTopicSchema } from "@module/topic/entities/user-topic.entity";
import { UserSchema } from "@module/user/entities/user.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { Schema } from "mongoose";
const SCHEMA_LIST: Schema[] = [
    UserSchema,
    OneSignalUserSchema,
    NotificationSchema,
    TopicSchema,
    UserTopicSchema,
    FileSchema,
    SettingSchema,
    IncrementSchema,
    ImportSessionSchema,
    DichVuSchema,
];

const MongooseModel = MongooseModule.forFeature(
    SCHEMA_LIST.map((schema) => ({ name: schema.get("collection"), schema })),
);

export default MongooseModel;
