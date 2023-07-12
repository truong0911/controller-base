import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { CommonQueryDto } from "./common-query.dto";
import { ExportDefinitionQueryDto } from "./entity-definition/export-definition-query.dto";

export class ExportQueryDto {
    @IsString({ each: true })
    @IsOptional()
    ids?: string[];

    @ValidateNested()
    @Type(() => CommonQueryDto)
    @IsOptional()
    query?: CommonQueryDto;

    @ValidateNested({ each: true })
    @Type(() => ExportDefinitionQueryDto)
    definitions: ExportDefinitionQueryDto[];
}
