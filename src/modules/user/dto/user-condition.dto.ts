import { IsOptional } from "class-validator";

export class UserConditionDto {
    @IsOptional()
    firstname?: any;

    @IsOptional()
    lastname?: any;

    @IsOptional()
    fullname?: any;
}
