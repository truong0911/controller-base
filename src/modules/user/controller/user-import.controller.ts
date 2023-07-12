import { BaseImportControllerFactory } from "@config/controller/base-import-controller-factory";
import { UserConditionDto } from "@module/user/dto/user-condition.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ImportUserDto } from "../dto/import-user.dto";
import { User } from "../entities/user.entity";
import { UserImportService } from "../service/user-import.service";

@Controller("user")
@ApiTags("user")
export class UserImportController extends BaseImportControllerFactory<User>(
    User,
    UserConditionDto,
    {
        import: {
            dto: ImportUserDto,
        },
    },
) {
    constructor(private readonly userImportService: UserImportService) {
        super(userImportService);
    }
}
