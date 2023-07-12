import { PickType } from "@nestjs/swagger";
import { DichVu } from "../entities/dich-vu.entity";

export class ImportDichVuDto extends PickType(DichVu, [
    "ten",
    "moTa",
    "giaTien",
    "menhGia",
]) {}
