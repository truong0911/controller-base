import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Auth } from "./entities/auth.entity";
import { AuthService } from "./auth.service";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthConditionDto } from "./dto/auth-condition.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController extends BaseControllerFactory(
    Auth,
    AuthConditionDto,
    Auth,
    Auth,
) {
    constructor(private readonly authService: AuthService) {
        super(authService);
    }
}
