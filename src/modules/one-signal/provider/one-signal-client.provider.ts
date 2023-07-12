import { Configuration } from "@config/configuration";
import { Inject, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as OneSignal from "onesignal-node";

export const ONE_SIGNAL_CLIENT = "ONE_SIGNAL_CLIENT";

export const OneSignalClient: Provider = {
    provide: ONE_SIGNAL_CLIENT,
    useFactory: (configService: ConfigService<Configuration>) => {
        const { appId, apiKey } = configService.get("oneSignal", {
            infer: true,
        });
        return new OneSignal.Client(appId, apiKey);
    },
    inject: [ConfigService],
};

export type OneSignalClient = OneSignal.Client;
export const InjectOneSignalClient = () => Inject(ONE_SIGNAL_CLIENT);
