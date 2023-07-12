import { TransformResponseInterceptor } from "@common/interceptor/transform-response.interceptor";
import configuration from "@config/configuration";
import { HttpExceptionFilter } from "@config/exception/http-exception.filter";
import { MicroserviceModule } from "@module/microservice/microservice.module";
import { MongooseConfigService } from "@module/repository/mongo/mongoose-config.service";
import { RepositoryModule } from "@module/repository/repository.module";
import { BullModule } from "@nestjs/bull";
import {
    DynamicModule,
    ForwardReference,
    Provider,
    Type,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import path from "path";

export const DefaultModules: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
> = [
    I18nModule.forRoot({
        fallbackLanguage: "vi",
        loaderOptions: {
            path: path.join(__dirname, "../../common/i18n/"),
            watch: true,
        },
        resolvers: [
            { use: QueryResolver, options: ["lang"] },
            AcceptLanguageResolver,
        ],
    }),
    BullModule.forRootAsync({
        useFactory: async (configService: ConfigService) => ({
            redis: {
                host: configService.get<string>("redis.host"),
                port: configService.get<number>("redis.port"),
                password: configService.get<string>("redis.password"),
            },
        }),
        inject: [ConfigService],
    }),
    ConfigModule.forRoot({
        load: [configuration],
        isGlobal: true,
    }),
    MongooseModule.forRootAsync({
        useClass: MongooseConfigService,
        inject: [ConfigService],
    }),
    RepositoryModule,
    MicroserviceModule,
];

export const DefaultProviders: Provider[] = [
    {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
    },
    {
        provide: APP_INTERCEPTOR,
        useClass: TransformResponseInterceptor,
    },
];
