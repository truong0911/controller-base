import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { CreateFileTransformedDto } from "../dto/create-file-transformed.interface";
import { CreateFileDto } from "../dto/create-file.dto";

export class FileUploadTransform
    implements PipeTransform<CreateFileDto, CreateFileTransformedDto>
{
    transform(
        value: CreateFileDto,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        metadata: ArgumentMetadata,
    ): CreateFileTransformedDto {
        let isPublic: boolean;
        if (value.public != null) {
            isPublic = value.public === "1";
        } else {
            isPublic = false;
        }
        return {
            isPublic,
        };
    }
}
