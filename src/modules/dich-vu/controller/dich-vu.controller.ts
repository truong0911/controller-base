import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DichVu } from "../entities/dich-vu.entity";
import { DichVuConditionDto } from "../dto/dich-vu-condition.dto";
import { CreateDichVuDto } from "../dto/create-dich-vu.dto";
import { UpdateDichVuDto } from "../dto/update-dich-vu.dto";
import { DichVuService } from "../service/dich-vu.service";

@Controller("dich-vu")
@ApiTags("dich-vu")
export class DichVuController extends BaseControllerFactory<DichVu>(
    DichVu,
    DichVuConditionDto,
    CreateDichVuDto,
    UpdateDichVuDto,
    {
        import: {
            enable: false,
        },
    },
) {
    constructor(private readonly dichVuService: DichVuService) {
        super(dichVuService);
    }
}
