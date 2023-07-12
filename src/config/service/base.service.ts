/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    DeleteOneQuery,
    GetByIdQuery,
    GetManyQuery,
    GetOneQuery,
    GetPageQuery,
    UpdateByIdQuery,
    UpdateManyQuery,
    UpdateOneQuery,
} from "@common/constant";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { ApiError } from "@config/exception/api-error";
import { ErrorCode } from "@config/exception/error-code";
import {
    BaseRepository,
    QueryCondition,
    UpdateDocument,
} from "@module/repository/common/base-repository.interface";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { User } from "@module/user/entities/user.entity";
import { BaseImportService } from "./base-import.service";

type ExportTransformedData = {
    fields: string[];
    value: unknown;
};

export class BaseService<E extends BaseEntity, R extends BaseRepository<E>> {
    constructor(
        private readonly repository: R,
        private readonly property: {
            notFoundCode?: ErrorCode;
            transaction?: BaseTransaction;
            importService?: BaseImportService<E, R>;
        } = {},
    ) {
        this.property.importService =
            this.property.importService ||
            new BaseImportService(repository, {
                transaction: this.property.transaction,
            });
    }

    getImportService(): BaseImportService<E, R> {
        return this.property.importService;
    }

    create(user: User, dto: any) {
        return this.repository.create(dto);
    }

    async getById(user: User, id: string, query?: GetByIdQuery) {
        const res = await this.repository.getById(id, query);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    async getOne(
        user: User,
        conditions: QueryCondition<E>,
        query?: GetOneQuery,
    ) {
        const res = await this.repository.getOne(conditions, query);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    getMany(user: User, conditions: QueryCondition<E>, query?: GetManyQuery) {
        return this.repository.getMany(conditions, query);
    }

    getPage(user: User, conditions: QueryCondition<E>, query?: GetPageQuery) {
        return this.repository.getPage(conditions, query);
    }

    async updateById(
        user: User,
        id: string,
        update: UpdateDocument<E>,
        query?: UpdateByIdQuery,
    ) {
        const res = await this.repository.updateById(id, update, query);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    async updateOne(
        user: User,
        conditions: QueryCondition<E>,
        update: UpdateDocument<E>,
        query?: UpdateOneQuery,
    ) {
        const res = await this.repository.updateOne(conditions, update, query);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    updateMany(
        user: User,
        conditions: QueryCondition<E>,
        update: UpdateDocument<E>,
        query?: UpdateManyQuery,
    ) {
        return this.repository.updateMany(conditions, update, query);
    }

    async deleteById(user: User, id: string) {
        const res = await this.repository.deleteById(id);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    async deleteOne(
        user: User,
        conditions: QueryCondition<E>,
        query?: DeleteOneQuery,
    ) {
        const res = await this.repository.deleteOne(conditions, query);
        if (!res && this.property.notFoundCode) {
            throw ApiError.NotFound(this.property.notFoundCode);
        }
        return res;
    }

    deleteMany(user: User, conditions: QueryCondition<E>) {
        return this.repository.deleteMany(conditions);
    }
}
