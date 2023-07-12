import { AllowMimeTypes } from "@common/constant";
import { ApiError } from "@config/exception/api-error";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MulterOptionsFactory } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import multer from "multer";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    constructor(private readonly configService: ConfigService) {}
    createMulterOptions(): MulterOptions {
        return {
            fileFilter: (req: Express.Request, file, callback) => {
                if (!AllowMimeTypes.some((t) => t.type === file.mimetype)) {
                    return callback(
                        ApiError.BadRequest("error-file-invalid-mimetype"),
                        false,
                    );
                }
                return callback(null, true);
            },
            storage: multer.memoryStorage(),
        };
    }
}
