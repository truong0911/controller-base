import { Controller } from "@nestjs/common";
import { SettingService } from "./setting.service";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Setting } from "./entities/setting.entity";
import { SettingConditionDto } from "./dto/setting-condition.dto";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("setting")
@ApiTags("setting")
export class SettingController extends BaseControllerFactory(
    Setting,
    SettingConditionDto,
    CreateSettingDto,
    CreateSettingDto,
    {
        routes: {
            create: {
                enable: false,
            },
            getById: {
                enable: false,
            },
            getPage: {
                enable: false,
            },
            getMany: {
                enable: false,
            },
            updateById: {
                enable: false,
            },
            deleteById: {
                enable: false,
            },
        },
    },
) {
    constructor(private readonly settingService: SettingService) {
        super(settingService);
    }
}
