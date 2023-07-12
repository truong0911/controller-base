import { GetPageQuery } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import {
    ApiCondition,
    ApiGet,
    ApiListResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import {
    RequestCondition,
    RequestQuery,
} from "@common/decorator/query.decorator";
import { EntityDefinitionDto } from "@common/dto/entity-definition/entity-definition.dto";
import { ImportResultDto } from "@common/dto/entity-definition/import-result.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { BaseImportDto } from "@common/interface/base-import.dto";
import { BaseControllerSetup } from "@config/controller/base-controller.decorator";
import {
    BaseImportController,
    BaseImportControllerConfig,
} from "@config/controller/base-controller.interface";
import { BaseImportService } from "@config/service/base-import.service";
import {
    BaseRepository,
    QueryCondition,
} from "@module/repository/common/base-repository.interface";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import { Body, Get, Next, Post, Res, Type } from "@nestjs/common";
import { PickType } from "@nestjs/swagger";
import { NextFunction, Response } from "express";

export function BaseImportControllerFactory<E extends BaseEntity>(
    entity: Type<E>,
    conditionDto: Type<unknown>,
    config: BaseImportControllerConfig = {
        authorize: true,
        roles: [SystemRole.ADMIN],
    },
): new (
    service: BaseImportService<E, BaseRepository<E, unknown>>,
) => BaseImportController<E> {
    config.roles = config.roles || [SystemRole.ADMIN];

    @BaseControllerSetup(config)
    class Controller implements BaseImportController<E> {
        constructor(
            private readonly service: BaseImportService<
                E,
                BaseRepository<E, unknown>
            >,
        ) {
            this.service = service;
        }

        @AllowSystemRoles(...config.roles)
        @Get(config.path?.importDefinition || "import/definition")
        @ApiListResponse(EntityDefinitionDto)
        async getImportDefinition(@ReqUser() user: User) {
            return this.service.getImportDefinition(
                user,
                config.import?.dto || entity,
            );
        }

        @AllowSystemRoles(...config.roles)
        @Get(config.path?.importXlsxTemplate || "import/template/xlsx")
        async getImportXlsxTemplate(
            @ReqUser() user: User,
            @Res() res: Response,
            @Next() next: NextFunction,
        ) {
            return this.service.getImportTemplate(user, entity, res, next);
        }

        @AllowSystemRoles(...config.roles)
        @Post(config.path?.importValidate || "import/validate")
        @ApiRecordResponse(ImportResultDto)
        async importValidate(
            @ReqUser() user: User,
            @Body() dto: BaseImportDto,
        ) {
            const importFields = EntityDefinition.getImportDefinition(
                entity,
            ).map((def) => def.field);
            const RowClass = PickType(
                config.import?.dto || entity,
                importFields as any,
            );
            return this.service.insertImport(user, dto, RowClass, {
                dryRun: true,
            });
        }

        @AllowSystemRoles(...config.roles)
        @Post(config.path?.importInsert || "import/insert")
        @ApiRecordResponse(ImportResultDto)
        async importInsert(@ReqUser() user: User, @Body() dto: BaseImportDto) {
            const importFields = EntityDefinition.getImportDefinition(
                entity,
            ).map((def) => def.field);
            const RowClass = PickType(
                config.import?.dto || entity,
                importFields as any,
            );
            return this.service.insertImport(user, dto, RowClass, {
                dryRun: false,
            });
        }

        @AllowSystemRoles(...config.roles)
        @Get(config.path?.exportDefinition || "export/definition")
        @ApiListResponse(EntityDefinitionDto)
        async getExportDefinition(@ReqUser() user: User) {
            return this.service.getExportDefinition(user, entity);
        }

        @AllowSystemRoles(...config.roles)
        @Get(config.path?.exportDefinition || "export/xlsx")
        @ApiCondition()
        @ApiGet({ mode: "many" })
        async getExport(
            @ReqUser() user: User,
            @RequestCondition(conditionDto) conditions: QueryCondition<E>,
            @RequestQuery() query: GetPageQuery,
            @Body() exportQuery: ExportQueryDto,
            @Res() res: Response,
            @Next() next: NextFunction,
        ) {
            return this.service.getExport(
                user,
                entity,
                conditions,
                query,
                exportQuery,
                res,
                next,
            );
        }
    }
    return Controller;
}
