import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { ApiRecordResponse } from "@common/decorator/api.decorator";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ChangePasswordDto } from "@module/user/dto/change-password.dto";
import { CreateUserDto } from "@module/user/dto/create-user.dto";
import { UpdateUserDto } from "@module/user/dto/update-user.dto";
import { UserConditionDto } from "@module/user/dto/user-condition.dto";

import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { User } from "../entities/user.entity";
import { UserService } from "../service/user.service";

@Controller("user")
@ApiTags("user")
export class UserController extends BaseControllerFactory<User>(
    User,
    UserConditionDto,
    CreateUserDto,
    UpdateUserDto,
    {
        import: {
            enable: false,
        },
    },
) {
    constructor(private readonly userService: UserService) {
        super(userService);
    }

    @Get("me")
    @ApiRecordResponse(User)
    async getMe(@Req() req: Request) {
        const authData = req.user as RequestAuthData;
        return this.userService.getMe(authData);
    }

    @Put("me/password")
    @ApiRecordResponse(User)
    async changePasswordMe(@Body() dto: ChangePasswordDto) {
        return this.userService.changePasswordMe(null, dto);
    }
}
