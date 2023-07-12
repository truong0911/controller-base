import { OmitType } from "@nestjs/swagger";
import { DichVu } from "../entities/dich-vu.entity";

export class CreateDichVuDto extends OmitType(DichVu, ["_id"]) {}
