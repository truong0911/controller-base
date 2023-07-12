import { IsOptional, ValidateNested } from "class-validator";
import { CommonQueryDto } from "./common-query.dto";
import { Type } from "class-transformer";

export class MicroserviceCommonQueryDto {
    @IsOptional()
    condition?: any;

    @ValidateNested()
    @Type(() => CommonQueryDto)
    query: CommonQueryDto;
}
