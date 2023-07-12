import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { OperatorType } from "../constant/constant";

export class FilterItemDto {
    @IsString()
    field: string;

    @IsEnum(OperatorType)
    @IsOptional()
    operator?: OperatorType;

    @IsArray()
    @IsOptional()
    values?: Array<string | number | Date | boolean | symbol>;
}
