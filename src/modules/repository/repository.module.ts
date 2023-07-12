import MongooseModel from "@module/repository/mongo/mongoose-model";
import MongooseSchemaProvider from "@module/repository/mongo/mongoose-model-provider";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    imports: [MongooseModel],
    providers: [...MongooseSchemaProvider],
    exports: [MongooseModel, ...MongooseSchemaProvider],
})
export class RepositoryModule {}
