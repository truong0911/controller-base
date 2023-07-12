import { Type } from "class-transformer";
import {
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";

export class PopulationDto {
    @IsString()
    path: string;

    @IsObject()
    @IsOptional()
    fields?: { [field: string]: 0 | 1 };

    @ValidateNested({ each: true })
    @Type(() => PopulationDto)
    @IsOptional()
    population?: PopulationDto[];
}
