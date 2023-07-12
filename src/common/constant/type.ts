import { CommonQueryDto } from "../dto/common-query.dto";

export type UpdateManyResult = { n?: number; affected: number };
export type DeleteManyResult = { n?: number; deleted: number };

export type GetByIdQuery = Pick<CommonQueryDto, "select" | "population">;
export type GetOneQuery = Pick<
    CommonQueryDto,
    "select" | "sort" | "filters" | "population"
>;
export type GetManyQuery = Pick<
    CommonQueryDto,
    "select" | "sort" | "filters" | "population"
>;
export type GetPageQuery = Pick<
    CommonQueryDto,
    "select" | "sort" | "page" | "limit" | "skip" | "filters" | "population"
>;

export type GetBatchQuery = Pick<
    CommonQueryDto,
    "select" | "limit" | "population"
>;

export type ExistQuery = Pick<CommonQueryDto, "filters">;
export type CountQuery = Pick<CommonQueryDto, "filters">;

type UpdateQuery = { upsert?: boolean; new?: boolean };
export type UpdateByIdQuery = UpdateQuery;
export type UpdateOneQuery = Pick<CommonQueryDto, "sort" | "filters"> &
    UpdateQuery;
export type UpdateManyQuery = Pick<CommonQueryDto, "filters"> & UpdateQuery;

export type DeleteOneQuery = Pick<CommonQueryDto, "sort" | "filters">;
export type DeleteManyQuery = Pick<CommonQueryDto, "filters">;
