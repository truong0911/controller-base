import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { Controller, Get, Next, Param, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NextFunction, Request, Response } from "express";
import { FileService } from "./file.service";

@Controller("file")
@ApiTags("file")
export class FilePublicController {
    constructor(private readonly fileService: FileService) {}

    @Get(":id/:name")
    @ApiBearerAuth()
    async getFileData(
        @ReqUser() user: User,
        @Param("id") id: string,
        @Req() req: Request,
        @Res() res: Response,
        @Next() next: NextFunction,
    ) {
        await this.fileService.getFileData(user, id, req, res, next);
    }
}
