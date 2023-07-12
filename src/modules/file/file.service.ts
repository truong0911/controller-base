import { Configuration } from "@config/configuration";
import { ApiError } from "@config/exception/api-error";
import { AccessSsoJwtPayload } from "@module/auth/auth.interface";
import { FileRepository } from "@module/file/repository/file-repository.interface";
import { Entity } from "@module/repository";
import { CreateDocument } from "@module/repository/common/base-repository.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { SettingKey } from "@module/setting/common/constant";
import { SettingService } from "@module/setting/setting.service";
import { User } from "@module/user/entities/user.entity";
import {
    Injectable,
    Logger,
    NotImplementedException,
    OnApplicationBootstrap,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { FileStorageType } from "./common/constant";
import { CreateFileResponseDto } from "./dto/create-file-response.dto";
import { CreateFileTransformedDto } from "./dto/create-file-transformed.interface";
import { File } from "./entities/file.entity";

@Injectable()
export class FileService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(Entity.FILE)
        private readonly fileRepository: FileRepository,
        private readonly configService: ConfigService<Configuration>,
        private readonly settingService: SettingService,
        private readonly jwtService: JwtService,
    ) {}

    async onApplicationBootstrap() {
        const setting = await this.settingService.getSettingValue(
            SettingKey.FILE_STORAGE,
        );
        if (!setting) {
            await this.settingService.setSettingValue(SettingKey.FILE_STORAGE, {
                type: FileStorageType.DATABASE,
            });
            Logger.verbose("File setting initialized", FileService.name);
        }
    }

    private getUrl(file: File) {
        const serverAddress = this.configService.get("server.address", {
            infer: true,
        });
        return `${serverAddress}/file/${file._id}/${encodeURIComponent(
            file.name,
        )}`;
    }

    private validateJwt(bearerToken: string): AccessSsoJwtPayload {
        const secret = this.configService.get("jwt.secret", {
            infer: true,
        });
        if (bearerToken?.substring(0, 7)?.toLowerCase() === "bearer ") {
            const jwt = bearerToken.substring(7);
            try {
                return this.jwtService.verify(jwt, { secret });
            } catch (err) {
                throw new UnauthorizedException();
            }
        } else {
            throw new UnauthorizedException();
        }
    }

    private async accessFile(id: string, req: Request) {
        // TODO: Phân quyền đọc file
        const file = await this.fileRepository.getById(id);
        if (!file) {
            throw ApiError.NotFound("error-file-not-found");
        }
        let payload: AccessSsoJwtPayload;
        if (!file.isPublic) {
            payload = this.validateJwt(req.headers.authorization);
        } else {
            try {
                payload = this.validateJwt(req.headers.authorization);
            } catch (err) {
                payload = null;
            }
        }
        return { file, payload };
    }

    async getFileData(
        user: User,
        id: string,
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const { file } = await this.accessFile(id, req);
        if (file) {
            res.setHeader("Content-Type", file.mimetype);
            res.end(Buffer.from(file.data, "base64"));
        } else {
            return next(ApiError.NotFound("error-file-not-found"));
        }
    }

    async create(
        user: User,
        dto: CreateFileTransformedDto,
        file: Express.Multer.File,
    ): Promise<CreateFileResponseDto> {
        const setting = await this.settingService.getSettingValue(
            SettingKey.FILE_STORAGE,
        );

        let data: string;

        // TODO: Tách xử lý data ra một hàm riêng
        switch (setting.type) {
            case FileStorageType.DATABASE: {
                data = file.buffer.toString("base64");
                break;
            }
            case FileStorageType.S3: {
                throw new NotImplementedException();
            }
            default: {
                throw new NotImplementedException();
            }
        }

        const doc: CreateDocument<File> = {
            ...dto,
            name: file.originalname,
            author: user._id,
            authorName:
                user.fullname ||
                [user.lastname, user.firstname].filter(Boolean).join(" ") ||
                user.username,
            mimetype: file.mimetype,
            storageType: setting.type,
            size: file.size,
            data,
        };
        const resFile = await this.fileRepository.create(doc);
        resFile.data = undefined;
        return { file: resFile, url: this.getUrl(resFile) };
    }

    async deleteById(user: User, id: string): Promise<File> {
        // TODO: Phân quyền xóa file, Log xóa file
        const res = await this.fileRepository.deleteOne({
            _id: id,
            author: user._id,
        });
        if (!res) {
            throw ApiError.NotFound("error-file-not-found");
        }
        return res;
    }
}
