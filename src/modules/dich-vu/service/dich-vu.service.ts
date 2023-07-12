import { BaseService } from "@config/service/base.service";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DichVu } from "../entities/dich-vu.entity";
import { DichVuRepository } from "../repository/dich-vu-repository.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectTransaction } from "@module/repository/common/transaction";
import { SettingService } from "@module/setting/setting.service";
import { Configuration } from "@config/configuration";
import { ConfigService } from "@nestjs/config";
import { CreateDichVuDto } from "../dto/create-dich-vu.dto";
import { ChangeGiaTienDto } from "../dto/change-gia-tien.dto";
import { ApiError } from "@config/exception/api-error";

@Injectable()
export class DichVuService extends BaseService<DichVu, DichVuRepository> {
    constructor(
        @InjectRepository(Entity.DICH_VU)
        private readonly dichVuRepository: DichVuRepository,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService<Configuration>,
        @InjectTransaction()
        private readonly dichVuTransaction: BaseTransaction,
    ) {
        super(dichVuRepository, {
            notFoundCode: "error-user-not-found",
            transaction: dichVuTransaction,
        });
    }
}
