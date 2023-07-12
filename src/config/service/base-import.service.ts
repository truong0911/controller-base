/* eslint-disable @typescript-eslint/no-unused-vars */
import { ExportType, exportFileHelper } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { ImportResultDto } from "@common/dto/entity-definition/import-result.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { BaseImportDto } from "@common/interface/base-import.dto";
import { ApiError } from "@config/exception/api-error";
import {
    BaseRepository,
    QueryCondition,
} from "@module/repository/common/base-repository.interface";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { User } from "@module/user/entities/user.entity";
import { Type } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";
import { NextFunction, Response } from "express";
import _ from "lodash";
import pLimit from "p-limit";
import xlsx from "xlsx";

type ExportTransformedData = {
    fields: string[];
    value: unknown;
};

export class BaseImportService<
    E extends BaseEntity,
    R extends BaseRepository<E>,
> {
    constructor(
        private readonly repository: R,
        private readonly property: {
            transaction: BaseTransaction;
            async?: boolean;
        },
    ) {}

    getImportDefinition(user: User, entity: Type<E>) {
        return EntityDefinition.getImportDefinition(entity);
    }

    getImportTemplate(
        user: User,
        entity: Type<E>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const definition = EntityDefinition.getImportDefinition(entity);
            const header = definition.map((d) => d.label);
            const wb = xlsx.utils.book_new();
            wb.SheetNames.push("Data");
            const ws = xlsx.utils.aoa_to_sheet([header]);
            wb.Sheets[wb.SheetNames[0]] = ws;
            const buffer = xlsx.write(wb, {
                type: "buffer",
                compression: true,
            });
            exportFileHelper(buffer, "import-template", ExportType.XLSX, res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * @override
     * @param rows Rows
     * @param transaction Transaction
     * @returns Rows, Context (Context dùng trong import)
     */
    async preprocessImport(
        rows: Array<{ index: number; row: any }>,
        transaction: unknown,
    ): Promise<{ rows: Array<{ index: number; row: any }>; context?: any }> {
        return { rows };
    }

    /**
     * Logic xác thực dữ liệu
     * @override
     * @param rowData Rows
     * @param transaction Transaction
     * @param context Context lấy từ hàm preprocessImport(), có thể bổ sung trong quá trình xử lý
     * @returns Error strings
     */
    async validateAndTransformRowData(
        rowData: { index: number; row: any },
        transaction: unknown,
        context?: any,
    ): Promise<{ doc: { index: number; row: any }; errors: string[] }> {
        return { doc: rowData, errors: [] };
    }

    /**
     * @override
     * Logic insert data vào CSDL
     * @param doc Bản ghi chứa data insert
     * @param context ValidateContext
     * @returns
     */
    async insertRowData(
        rowData: { index: number; row: any },
        transaction: unknown,
        context?: any,
    ): Promise<E> {
        const res = await this.repository.create(rowData.row, {
            transaction,
        });
        return res;
    }

    private async defaultValidateRowType(
        rowData: { index: number; row: any },
        RowClass: Type,
    ): Promise<string[]> {
        const rowClass = plainToClass(RowClass, rowData.row);
        const errorData = validateSync(rowClass);
        const defaultErrors = errorData.reduce(
            (list, e) => list.concat(Object.values(e.constraints)),
            [],
        );
        return defaultErrors;
    }

    async insertImport(
        user: User,
        dto: BaseImportDto,
        RowClass: Type<any>,
        options?: {
            dryRun: boolean;
        },
    ): Promise<ImportResultDto> {
        if (!this.property.transaction) {
            throw ApiError.BadRequest("error-import-transaction-empty");
        }
        const transaction = await this.property.transaction.startTransaction();
        const limit = pLimit(this.property?.async !== true ? 1 : 256);
        let error = false;
        const rowDataList = dto.rows.map((row, index) => ({ row, index }));
        const { rows, context } = await this.preprocessImport(
            rowDataList,
            transaction,
        );
        const validate: ImportResultDto["validate"] = await Promise.all(
            rows.map((rowData, index) =>
                limit(async () => {
                    const [defaultErrors, { doc, errors }] = await Promise.all([
                        this.defaultValidateRowType(rowData, RowClass),
                        this.validateAndTransformRowData(
                            rowData,
                            transaction,
                            context,
                        ),
                    ]);
                    const rowErrors = [...defaultErrors, ...errors];
                    if (rowErrors.length === 0) {
                        try {
                            await this.insertRowData(doc, transaction, context);
                        } catch (err) {
                            const dataErrors =
                                this.repository.getRepositoryErrors(err);
                            rowErrors.push(...dataErrors);
                        }
                    }
                    error = error || rowErrors.length > 0;
                    return {
                        row: rowData.row,
                        index: rowData.index,
                        rowErrors,
                    };
                }),
            ),
        );
        if (options?.dryRun !== true) {
            await this.property.transaction.commitTransaction(transaction);
        } else {
            await this.property.transaction.abortTransaction(transaction);
        }
        return {
            error,
            validate,
        };
    }

    getExportDefinition(user: User, entity: Type<E>) {
        return EntityDefinition.getExportDefinition(entity);
    }

    private transformExportData(
        object: unknown,
        parendFields: string[],
    ): ExportTransformedData[] {
        const type = typeof object;
        let result: ExportTransformedData[] = [];
        if (type === "object") {
            _.forOwn(document, (value, key) => {
                const fields = parendFields.concat(key);
                const childResult = this.transformExportData(value, fields);
                result = result.concat(...childResult);
            });
        } else {
            return [{ fields: parendFields, value: object }];
        }
        return result;
    }

    async getExport(
        user: User,
        entity: Type<E>,
        conditions: QueryCondition<E>,
        query: CommonQueryDto,
        exportQuery: ExportQueryDto,
        res: Response,
        next: NextFunction,
    ) {
        const data = await this.repository.getExport(
            conditions,
            query,
            exportQuery,
        );
        const exportData = data.map((document) =>
            this.transformExportData(document, []),
        );
        const wb = xlsx.utils.book_new();
        wb.SheetNames.push("Data");
        const ws = xlsx.utils.json_to_sheet(exportData);
        wb.Sheets[wb.SheetNames[0]] = ws;
        const buffer = xlsx.write(wb, {
            type: "buffer",
            compression: true,
        });
        exportFileHelper(
            buffer,
            `export-${entity.name}.xlsx`,
            ExportType.XLSX,
            res,
        );
    }
}
