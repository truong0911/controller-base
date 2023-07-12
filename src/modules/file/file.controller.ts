import { ApiRecordResponse } from "@common/decorator/api.decorator";
import { Authorization, ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CreateFileResponseDto } from "./dto/create-file-response.dto";
import { CreateFileTransformedDto } from "./dto/create-file-transformed.interface";
import { CreateFileDto } from "./dto/create-file.dto";
import { File } from "./entities/file.entity";
import { FileService } from "./file.service";
import { FileUploadTransform } from "./pipe/file-upload-transform.pipe";

@Controller("file")
@ApiTags("file")
@Authorization()
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file"))
    @ApiRecordResponse(CreateFileResponseDto)
    @ApiBody({ type: CreateFileDto })
    async create(
        @ReqUser() user: User,
        @Body(FileUploadTransform) dto: CreateFileTransformedDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const data = await this.fileService.create(user, dto, file);
        return data;
    }

    @Delete(":id")
    @ApiRecordResponse(File)
    async deleteById(@ReqUser() user: User, @Param("id") id: string) {
        await this.fileService.deleteById(user, id);
    }
}
