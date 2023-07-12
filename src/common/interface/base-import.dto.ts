import { IsObject } from "class-validator";

export class BaseImportDto {
    @IsObject({ each: true })
    rows: any[];
}
