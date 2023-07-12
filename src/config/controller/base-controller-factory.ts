import { GetManyQuery, GetPageQuery } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import {
    ApiCondition,
    ApiGet,
    ApiListResponse,
    ApiPageResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { ReqUser } from "@common/decorator/auth.decorator";
import {
    RequestCondition,
    RequestQuery,
} from "@common/decorator/query.decorator";
import { EntityDefinitionDto } from "@common/dto/entity-definition/entity-definition.dto";
import { ImportResultDto } from "@common/dto/entity-definition/import-result.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { BaseImportDto } from "@common/interface/base-import.dto";
import { AbstractValidationPipe } from "@common/pipe/abstract-validation.pipe";
import {
    BaseControllerSetup,
    BaseRouteSetup,
} from "@config/controller/base-controller.decorator";
import {
    BaseController,
    BaseControllerConfig,
} from "@config/controller/base-controller.interface";
import { BaseService } from "@config/service/base.service";
import {
    BaseRepository,
    CreateDocument,
    QueryCondition,
    UpdateDocument,
} from "@module/repository/common/base-repository.interface";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import { Body, Next, Param, Res, Type, UsePipes } from "@nestjs/common";
import { ApiBody, PickType } from "@nestjs/swagger";
import { NextFunction, Response } from "express";

export function BaseControllerFactory<E extends BaseEntity>(
    entity: Type<E>,
    conditionDto: Type<unknown>,
    createDto: Type<unknown>,
    updateDto: Type<unknown>,
    config: BaseControllerConfig = {
        authorize: true,
        routes: {
            create: {
                roles: [SystemRole.ADMIN],
            },
            getById: {
                roles: [SystemRole.ADMIN],
            },
            getMany: {
                roles: [SystemRole.ADMIN],
            },
            getPage: {
                roles: [SystemRole.ADMIN],
            },
            updateById: {
                roles: [SystemRole.ADMIN],
            },
            deleteById: {
                roles: [SystemRole.ADMIN],
            },
            importDefinition: {
                roles: [SystemRole.ADMIN],
            },
            importXlsxTemplate: {
                roles: [SystemRole.ADMIN],
            },
            importInsert: {
                roles: [SystemRole.ADMIN],
            },
            importValidate: {
                roles: [SystemRole.ADMIN],
            },
            exportDefinition: {
                roles: [SystemRole.ADMIN],
            },
            exportXlsx: {
                roles: [SystemRole.ADMIN],
            },
        },
        import: {
            enable: true,
        },
    },
): new (
    service: BaseService<E, BaseRepository<E, unknown>>,
) => BaseController<E> {
    const createPipe = new AbstractValidationPipe(
        { whitelist: true },
        { body: createDto },
    );
    const updatePipe = new AbstractValidationPipe(
        { whitelist: true },
        { body: updateDto },
    );

    @BaseControllerSetup(config)
    class Controller implements BaseController<E> {
        constructor(
            private readonly service: BaseService<
                E,
                BaseRepository<E, unknown>
            >,
        ) {
            this.service = service;
        }

        @BaseRouteSetup("create", config, "post")
        @ApiRecordResponse(entity)
        @ApiBody({ type: createDto })
        @UsePipes(createPipe)
        async create(@ReqUser() user: User, @Body() dto: CreateDocument<E>) {
            return this.service.create(user, dto);
        }

        @BaseRouteSetup("getMany", config, "get")
        @ApiListResponse(entity)
        @ApiCondition()
        @ApiGet({ mode: "many" })
        async getMany(
            @ReqUser() user: User,
            @RequestCondition(conditionDto) conditions: QueryCondition<E>,
            @RequestQuery() query: GetManyQuery,
        ) {
            return this.service.getMany(user, conditions, query);
        }

        @BaseRouteSetup("getPage", config, "get")
        @ApiPageResponse(entity)
        @ApiCondition()
        @ApiGet()
        async getPage(
            @ReqUser() user: User,
            @RequestCondition(conditionDto) conditions: QueryCondition<E>,
            @RequestQuery() query: GetPageQuery,
        ) {
            return this.service.getPage(user, conditions, query);
        }

        @BaseRouteSetup("getById", config, "get")
        @ApiRecordResponse(entity)
        async getById(@ReqUser() user: User, @Param("id") id: string) {
            return this.service.getById(user, id);
        }

        @BaseRouteSetup("updateById", config, "put")
        @ApiBody({ type: updateDto })
        @ApiRecordResponse(entity)
        @UsePipes(updatePipe)
        async updateById(
            @ReqUser() user: User,
            @Param("id") id: string,
            @Body() dto: UpdateDocument<E>,
        ) {
            return this.service.updateById(user, id, dto);
        }

        @BaseRouteSetup("deleteById", config, "delete")
        @ApiRecordResponse(entity)
        async deleteById(@ReqUser() user: User, @Param("id") id: string) {
            return this.service.deleteById(user, id);
        }

        @BaseRouteSetup("importDefinition", config, "get")
        @ApiListResponse(EntityDefinitionDto)
        async getImportDefinition(@ReqUser() user: User) {
            return this.service
                .getImportService()
                .getImportDefinition(user, config.import?.dto || entity);
        }

        @BaseRouteSetup("importXlsxTemplate", config, "get")
        async getImportXlsxTemplate(
            @ReqUser() user: User,
            @Res() res: Response,
            @Next() next: NextFunction,
        ) {
            return this.service
                .getImportService()
                .getImportTemplate(user, entity, res, next);
        }

        @BaseRouteSetup("importValidate", config, "post")
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
            return this.service
                .getImportService()
                .insertImport(user, dto, RowClass, {
                    dryRun: true,
                });
        }

        @BaseRouteSetup("importInsert", config, "post")
        @ApiRecordResponse(ImportResultDto)
        async importInsert(@ReqUser() user: User, @Body() dto: BaseImportDto) {
            const importFields = EntityDefinition.getImportDefinition(
                entity,
            ).map((def) => def.field);
            const RowClass = PickType(
                config.import?.dto || entity,
                importFields as any,
            );
            return this.service
                .getImportService()
                .insertImport(user, dto, RowClass, {
                    dryRun: false,
                });
        }

        @BaseRouteSetup("exportDefinition", config, "get")
        @ApiListResponse(EntityDefinitionDto)
        async getExportDefinition(@ReqUser() user: User) {
            return this.service
                .getImportService()
                .getExportDefinition(user, entity);
        }

        @BaseRouteSetup("exportXlsx", config, "post")
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
            return this.service
                .getImportService()
                .getExport(
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
