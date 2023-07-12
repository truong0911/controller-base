import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ExportDefinitionDto } from "@common/dto/entity-definition/export-definition.dto";
import { ImportDefinitionDto } from "@common/dto/entity-definition/import-definition.dto";
import { ImportResultDto } from "@common/dto/entity-definition/import-result.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { PageableDto } from "@common/dto/pageable.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { BaseImportDto } from "@common/interface/base-import.dto";
import { QueryCondition } from "@module/repository/common/base-repository.interface";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import { Type } from "@nestjs/common";
import { NextFunction, Response } from "express";

export interface BaseImportController<E extends BaseEntity> {
    getImportDefinition(user: User): Promise<ImportDefinitionDto[]>;

    getImportXlsxTemplate(
        user: User,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    importValidate(user: User, dto: BaseImportDto): Promise<ImportResultDto>;

    importInsert(user: User, dto: BaseImportDto): Promise<ImportResultDto>;

    getExportDefinition(user: User): Promise<ExportDefinitionDto[]>;
    getExport(
        user: User,
        conditions: QueryCondition<E>,
        query: GetPageQuery,
        exportQuery: ExportQueryDto,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
}

export interface BaseController<E extends BaseEntity>
    extends BaseImportController<E> {
    create(user: User, dto: unknown): Promise<E>;

    getMany(user: User, conditions: unknown, query: GetManyQuery): Promise<E[]>;

    getPage(
        user: User,
        conditions: unknown,
        query: GetPageQuery,
    ): Promise<PageableDto<E>>;

    getById(user: User, id: string): Promise<E>;

    updateById(user: User, id: string, dto: unknown): Promise<E>;

    deleteById(user: User, id: string): Promise<E>;
}

export interface BaseControllerConfig {
    authorize?: boolean;
    roles?: SystemRole[];
    routes?: {
        [key in BaseRoute]?: BaseRouteConfig;
    };
    import?: {
        enable?: boolean;
        dto?: Type<any>;
    };
}

export interface BaseImportControllerConfig
    extends Omit<BaseControllerConfig, "routes" | "import"> {
    import?: {
        dto?: Type<any>;
    };
    path?: {
        importDefinition?: string;
        importXlsxTemplate?: string;
        importValidate?: string;
        importInsert?: string;
        exportDefinition?: string;
        exportXlsx?: string;
    };
}

export interface BaseRouteConfig {
    enable?: boolean;
    roles?: SystemRole[];
}

export type BaseRoute =
    | "create"
    | "getMany"
    | "getPage"
    | "getById"
    | "updateById"
    | "deleteById"
    | "importDefinition"
    | "importXlsxTemplate"
    | "importValidate"
    | "importInsert"
    | "exportDefinition"
    | "exportXlsx";
