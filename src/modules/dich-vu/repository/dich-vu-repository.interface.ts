import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { DichVu } from "../entities/dich-vu.entity";

export interface DichVuRepository extends BaseRepository<DichVu> {
    getMe(dichVu: DichVu): Promise<DichVu>;
}
