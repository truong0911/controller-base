import { IsNotEmpty, IsNumber } from "class-validator";

export class ChangeGiaTienDto {
    @IsNotEmpty()
    @IsNumber()
    giaCu: number;

    @IsNotEmpty()
    @IsNumber()
    giaMoi: number;
}
