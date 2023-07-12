import { Logger } from "@nestjs/common";

const logger = new Logger("Configuration");

export const getEnv = (key: string, defaultValue?: string): string => {
    let value = process.env[key];
    if (value === undefined) {
        const message = [`${key} empty`];
        if (defaultValue !== undefined) {
            message.push(`use default: ${defaultValue}`);
            value = defaultValue;
        }
        logger.warn(message.join(", "));
    }
    return value;
};

export enum Environment {
    PRODUCTION = "production",
    STAGING = "staging",
    DEVELOPMENT = "development",
}

export interface Configuration {
    server: {
        env: Environment;
        port: number;
        address: string;
        documentPath: string;
        defaultAdminPassword: string;
    };
    microservice: {
        gRPC: {
            url: string;
            client: { [module: string]: { url: string } };
        };
        tcp: {
            host: string;
            port: number;
            client: { [module: string]: { host: string; port: number } };
        };
        rabbitMQ: {
            url: string;
        };
    };
    jwt: {
        secret: string;
        exp: number;
        refreshSecret: string;
        refreshExp: number;
    };
    database: {
        uri: string;
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        name?: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    oneSignal: {
        appId: string;
        apiKey: string;
    };
    sso: {
        jwksUri: string;
        usernameField: string;
        emailField: string;
        firstNameField: string;
        lastNameField: string;
    };
}

export default (): Configuration => {
    const serverPort = Number(getEnv("SERVER_PORT")) || 3000;
    const server: Configuration["server"] = {
        env: getEnv("SERVER_ENV", Environment.DEVELOPMENT) as Environment,
        address: getEnv("SERVER_ADDRESS", `http://localhost:${serverPort}`),
        port: serverPort,
        documentPath: getEnv("SERVER_DOCUMENT_PATH", "api"),
        defaultAdminPassword: getEnv("SERVER_DEFAULT_ADMIN_PASSWORD", "admin"),
    };

    const microserviceGrpcHost = getEnv("MICROSERVICE_GRPC_HOST", "0.0.0.0");
    const microserviceGrpcPort = getEnv("MICROSERVICE_GRPC_PORT", "3001");

    const microserviceTcpHost = getEnv("MICROSERVICE_TCP_HOST", "0.0.0.0");
    const microserviceTcpPort = Number(getEnv("MICROSERVICE_TCP_PORT", "3002"));

    const microservice: Configuration["microservice"] = {
        gRPC: {
            url: `${microserviceGrpcHost}:${microserviceGrpcPort}`,
            client: {
                local: {
                    url: `localhost:${microserviceGrpcPort}`,
                },
            },
        },
        tcp: {
            host: microserviceTcpHost,
            port: microserviceTcpPort,
            client: {
                local: {
                    host: microserviceTcpHost,
                    port: microserviceTcpPort,
                },
            },
        },
        rabbitMQ: {
            url: getEnv("MICROSERVICE_RABBITMQ_URL"),
        },
    };

    const database: Configuration["database"] = {
        uri: getEnv("DB_URI"),
    };

    const jwt: Configuration["jwt"] = {
        secret: getEnv("JWT_SECRET"),
        exp: Number(getEnv("JWT_EXP")) || undefined,
        refreshSecret: getEnv("JWT_REFRESH_SECRET"),
        refreshExp: Number(getEnv("JWT_REFRESH_EXP")) || undefined,
    };

    if (!database.uri) {
        database.host = getEnv("DB_HOST", "localhost");
        database.port = Number(getEnv("DB_PORT"));
        database.name = getEnv("DB_NAME");
        database.username = getEnv("DB_USER");
        database.password = getEnv("DB_PASSWORD");
    }

    const redis: Configuration["redis"] = {
        host: getEnv("REDIS_HOST"),
        port: Number(getEnv("REDIS_PORT")),
        password: getEnv("REDIS_PASSWORD"),
    };

    const oneSignal: Configuration["oneSignal"] = {
        appId: getEnv("ONE_SIGNAL_APP_ID"),
        apiKey: getEnv("ONE_SIGNAL_API_KEY"),
    };

    const sso: Configuration["sso"] = {
        jwksUri: getEnv("SSO_JWKS_URI"),
        usernameField: getEnv("SSO_USERNAME_FIELD", "preferred_username"),
        emailField: getEnv("SSO_EMAIL_FIELD", "email"),
        firstNameField: getEnv("SSO_EMAIL_FIELD", "given_name"),
        lastNameField: getEnv("SSO_EMAIL_FIELD", "family_name"),
    };

    return {
        server,
        microservice,
        jwt,
        database,
        redis,
        oneSignal,
        sso,
    };
};
