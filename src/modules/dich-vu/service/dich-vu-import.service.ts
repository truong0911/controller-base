import { BaseImportService } from "@config/service/base-import.service";
import { Injectable } from "@nestjs/common";
import { DichVu } from "../entities/dich-vu.entity";
import { DichVuRepository } from "../repository/dich-vu-repository.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";

@Injectable()
export class DichVuImportService extends BaseImportService<
    DichVu,
    DichVuRepository
> {
    constructor(
        @InjectRepository(Entity.DICH_VU)
        private readonly dichVuRepository: DichVuRepository,
        @InjectTransaction()
        private readonly dichVuTransaction: BaseTransaction,
    ) {
        super(dichVuRepository, { transaction: dichVuTransaction });
    }
}
