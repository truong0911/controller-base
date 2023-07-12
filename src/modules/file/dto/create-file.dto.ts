import { ApiProperty } from "@nestjs/swagger";
import { Allow, IsIn } from "class-validator";

export class CreateFileDto {
    @ApiProperty({ type: "string", format: "binary" })
    @Allow()
    file: string;

    @IsIn(["0", "1"])
    @ApiProperty({ enum: ["0", "1"] })
    public: string;
}
