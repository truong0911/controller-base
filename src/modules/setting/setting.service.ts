import { ApiError } from "@config/exception/api-error";
import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import {
    MAP_SETTING_ENTITY,
    SettingKey,
    SettingValue,
} from "./common/constant";
import { Setting } from "./entities/setting.entity";
import { SettingRepository } from "./repository/setting-repository.interface";
import { SettingImportService } from "./setting-import.service";

@Injectable()
export class SettingService extends BaseService<Setting, SettingRepository> {
    constructor(
        @InjectRepository(Entity.SETTING)
        private readonly settingRepository: SettingRepository,
        @InjectTransaction()
        private readonly settingTransaction: BaseTransaction,
        private readonly settingImportService: SettingImportService,
    ) {
        super(settingRepository, {
            transaction: settingTransaction,
            importService: settingImportService,
        });
    }

    async setSettingValue<T extends SettingKey>(
        key: T,
        value: SettingValue<T>,
    ): Promise<Setting> {
        const ValueClass = MAP_SETTING_ENTITY[key];
        if (!ValueClass) {
            throw ApiError.BadRequest("error-setting-incomplete");
        }
        const valueFromClass = plainToClass(ValueClass, value);
        const validateResult = await validate(valueFromClass as any, {
            whitelist: true,
            stopAtFirstError: true,
        });
        if (validateResult.length > 0) {
            console.error(validateResult);
            throw ApiError.BadRequest("error-setting-value-invalid");
        }
        return this.settingRepository.updateOne(
            { key },
            { value },
            { upsert: true },
        );
    }

    async getSettingValue<T extends SettingKey>(
        key: T,
    ): Promise<SettingValue<T>> {
        return this.settingRepository
            .getOne({ key })
            .then((res) => res?.value as SettingValue<T>);
    }
}
