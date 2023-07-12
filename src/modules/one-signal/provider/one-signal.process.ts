import { QueueName } from "@common/constant";
import { OneSignalSendBatchJob } from "@module/one-signal/interface/one-signal.interface";
import {
    InjectOneSignalClient,
    OneSignalClient,
} from "@module/one-signal/provider/one-signal-client.provider";
import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueError,
    OnQueueFailed,
    Process,
    Processor,
} from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { CreateNotificationBody } from "onesignal-node/lib/types";

@Processor(QueueName.ONE_SIGNAL)
export class OneSignalProcessor {
    private readonly logger = new Logger(OneSignalProcessor.name);

    constructor(
        @InjectOneSignalClient()
        private readonly oneSignalClient: OneSignalClient,
    ) {}

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.verbose(`Processing job ${job.id} of type ${job.name}`);
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        this.logger.verbose(`Completed job ${job.id} of type ${job.name}`);
    }

    @OnQueueError()
    onError(err: any) {
        this.logger.error(`Error job ${err}`);
    }

    @OnQueueFailed()
    onFailed(job: Job, error: Error) {
        this.logger.error(
            `Failed job ${job.id} of type ${job.name} with error: ${error.message}`,
        );
    }

    @Process("send-batch")
    async sendBatch(job: Job<OneSignalSendBatchJob>) {
        const { playerIds, notification } = job.data;
        const oneSignalNotification: CreateNotificationBody = {
            include_player_ids: playerIds,
            headings: { en: notification.title },
            contents: { en: notification.content },
            adm_big_picture: notification.imageUrl,
            chrome_web_image: notification.imageUrl,
            data: notification.data,
        };
        if (notification.createdAt !== undefined) {
            Object.assign(oneSignalNotification, {
                send_after: notification.createdAt.toISOString(),
            });
        }
        const res = await this.oneSignalClient.createNotification(
            oneSignalNotification,
        );
        this.logger.verbose(`${res.statusCode} ${JSON.stringify(res.body)}`);
    }
}
