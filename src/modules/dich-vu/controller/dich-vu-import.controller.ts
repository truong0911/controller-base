import { BaseImportControllerFactory } from "@config/controller/base-import-controller-factory";
import { DichVu } from "../entities/dich-vu.entity";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DichVuConditionDto } from "../dto/dich-vu-condition.dto";
import { ImportDichVuDto } from "../dto/import-dich-vu.dto";
import { DichVuImportService } from "../service/dich-vu-import.service";

@Controller("dich-vu")
@ApiTags("dich-vu")
export class DichVuImportController extends BaseImportControllerFactory<DichVu>(
    DichVu,
    DichVuConditionDto,
    {
        import: {
            dto: ImportDichVuDto,
        },
    },
) {
    constructor(private readonly dichVuImportService: DichVuImportService) {
        super(dichVuImportService);
    }
}
