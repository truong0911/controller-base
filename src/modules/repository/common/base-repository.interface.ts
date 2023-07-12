import {
    CountQuery,
    DeleteManyQuery,
    DeleteManyResult,
    DeleteOneQuery,
    ExistQuery,
    GetBatchQuery,
    GetByIdQuery,
    GetManyQuery,
    GetOneQuery,
    GetPageQuery,
    UpdateByIdQuery,
    UpdateManyQuery,
    UpdateManyResult,
    UpdateOneQuery,
} from "@common/constant";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { PageableDto } from "@common/dto/pageable.dto";
import { PopulationDto } from "@common/dto/population.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";

export type CreateDocument<E extends BaseEntity> = Partial<Pick<E, "_id">> &
    Omit<E, "_id">;

export type UpdateDocument<E extends BaseEntity> = Partial<CreateDocument<E>>;

export type QueryCondition<E extends BaseEntity> = {
    [P in keyof E]?: boolean | number | bigint | string | Date | object;
} & { [key: string]: boolean | number | bigint | string | Date | object };

type BasePopulateKey =
    | "getById"
    | "getOne"
    | "getMany"
    | "getPage"
    | "getBatch";

type BasePopulateOption = {
    [key in BasePopulateKey]?: PopulationDto[];
};

export type BaseRepositoryOption = {
    populate?: BasePopulateOption;
};

export type BaseQueryOption<T> = {
    transaction?: T;
};

export type BaseCommandOption<T> = {
    transaction?: T;
};

export interface BaseRepository<E extends BaseEntity, T = unknown> {
    create(
        document: CreateDocument<E>,
        options?: BaseCommandOption<T>,
    ): Promise<E>;

    insertMany(
        documents: CreateDocument<E>[],
        options?: BaseCommandOption<T>,
    ): Promise<{ n: number }>;

    getById(
        id: string,
        query?: GetByIdQuery & BaseQueryOption<T>,
    ): Promise<E | null>;

    getOne(
        conditions: QueryCondition<E>,
        query?: GetOneQuery & BaseQueryOption<T>,
    ): Promise<E | null>;

    getMany(
        conditions: QueryCondition<E>,
        query?: GetManyQuery & BaseQueryOption<T>,
    ): Promise<E[]>;

    getPage(
        conditions: QueryCondition<E>,
        query?: GetPageQuery & BaseQueryOption<T>,
    ): Promise<PageableDto<E>>;

    getBatch(
        conditions: any,
        query?: GetBatchQuery & BaseQueryOption<T>,
    ): AsyncGenerator<E[], E[], string>;

    distinct<Type = any>(field: string, conditions?: any): Promise<Type[]>;

    updateById(
        id: string,
        update: UpdateDocument<E>,
        query?: UpdateByIdQuery & BaseCommandOption<T>,
    ): Promise<E | null>;

    updateOne(
        conditions: QueryCondition<E>,
        update: UpdateDocument<E>,
        query?: UpdateOneQuery & BaseCommandOption<T>,
    ): Promise<E | null>;

    updateMany(
        conditions: QueryCondition<E>,
        update: any,
        query?: UpdateManyQuery & BaseCommandOption<T>,
    ): Promise<UpdateManyResult>;

    deleteById(id: string, query?: BaseCommandOption<T>): Promise<E>;

    deleteOne(
        conditions: QueryCondition<E>,
        query?: DeleteOneQuery & BaseCommandOption<T>,
    ): Promise<E>;
    deleteMany(
        conditions: QueryCondition<E>,
        query?: DeleteManyQuery & BaseCommandOption<T>,
    ): Promise<DeleteManyResult>;

    exists(
        conditions?: QueryCondition<E>,
        query?: ExistQuery & BaseQueryOption<T>,
    ): Promise<boolean>;
    count(
        conditions?: QueryCondition<E>,
        query?: CountQuery & BaseQueryOption<T>,
    ): Promise<number>;

    getExport(
        conditions: any,
        query: CommonQueryDto & BaseQueryOption<T>,
        exportQuery: ExportQueryDto,
    ): Promise<E[]>;

    getRepositoryErrors(err: Error): string[];
}
