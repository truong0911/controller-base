import { IsOptional } from "class-validator";

export class DichVuConditionDto {
    @IsOptional()
    moTa?: any;
}
