import { Configuration } from "@config/configuration";
import { getServerGrpcConfig } from "@module/microservice/grpc/common/constant";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { GrpcOptions, TcpOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "body-parser";
import { I18nMiddleware } from "nestjs-i18n";
import "reflect-metadata";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<Configuration>);
    app.use(I18nMiddleware);

    const {
        port,
        documentPath,
        address: serverAddress,
    } = configService.get("server", {
        infer: true,
    });

    const { gRPC, tcp } = configService.get("microservice", {
        infer: true,
    });

    const swaggerConfig = new DocumentBuilder()
        .addServer(serverAddress, "Server")
        .addServer(`http://localhost:${port}`, "Local")
        .addBearerAuth()
        .setVersion("0.0.1")
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(documentPath, app, document, {
        swaggerOptions: {
            displayRequestDuration: true,
            filter: true,
            operationsSorter: (a: any, b: any) => {
                const order: { [field: string]: string } = {
                    get: "0",
                    post: "1",
                    put: "2",
                    delete: "3",
                };
                const [pathA, methodA]: [string, string] = [
                    a._root.entries[0][1],
                    a._root.entries[1][1],
                ];

                const [pathB, methodB]: [string, string] = [
                    b._root.entries[0][1],
                    b._root.entries[1][1],
                ];
                return (
                    `${pathA}/`.localeCompare(`${pathB}/`) ||
                    order[methodA].localeCompare(order[methodB])
                );
            },
            plugins: [
                () => {
                    return {
                        fn: {
                            opsFilter: (taggedOps: any, phrase: string) => {
                                return taggedOps.filter(
                                    (_: unknown, tag: string) => {
                                        return tag
                                            .toLowerCase()
                                            .includes(phrase.toLowerCase());
                                    },
                                );
                            },
                        },
                    };
                },
            ],
        },
    });

    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );

    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ limit: "50mb", extended: true }));

    const protoConfig = getServerGrpcConfig();

    app.connectMicroservice<GrpcOptions>({
        transport: Transport.GRPC,
        options: {
            package: protoConfig.packages,
            protoPath: protoConfig.paths,
            url: gRPC.url,
        },
    });

    app.connectMicroservice<TcpOptions>({
        transport: Transport.TCP,
        options: {
            host: tcp.host,
            port: tcp.port,
        },
    });

    await app.startAllMicroservices();
    await app.listen(port);
}
bootstrap();
