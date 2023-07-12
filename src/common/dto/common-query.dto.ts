import { Type } from "class-transformer";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { FilterItemDto } from "./filter-item.dto";
import { PopulationDto } from "./population.dto";

export class CommonQueryDto {
    @IsOptional()
    select?: { [field: string]: 0 | 1 };

    @IsOptional()
    sort?: { [field: string]: -1 | 1 };

    @ValidateNested({ each: true })
    @Type(() => FilterItemDto)
    @IsOptional()
    filters?: FilterItemDto[];

    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsNumber()
    skip?: number;

    @ValidateNested({ each: true })
    @Type(() => PopulationDto)
    @IsOptional()
    population?: PopulationDto[];
}
