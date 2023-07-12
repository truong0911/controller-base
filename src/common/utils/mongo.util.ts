import { OperatorType } from "@common/constant";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { PopulationDto } from "@common/dto/population.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { QueryCondition } from "@module/repository/common/base-repository.interface";
import { HydratedDocument, PopulateOptions, QueryOptions } from "mongoose";

class MongoUtilLoader {
    convertExportQuery<E>(exportQuery: ExportQueryDto): {
        condition: any;
        query: QueryOptions<HydratedDocument<E>>;
    } {
        // TODO
        const condition: unknown = {};
        if (exportQuery.ids) {
            Object.assign(condition, { _id: { $in: exportQuery.ids } });
        } else if (exportQuery.query) {
            Object.assign(condition, {});
        }
        return {
            condition,
            query: exportQuery.query,
        };
    }

    getPopulate(population: PopulationDto[]): PopulateOptions[] {
        if (population) {
            return population.map((option) => ({
                path: option.path,
                select: option.fields,
                populate: this.getPopulate(option.population),
            }));
        }
    }

    getCondition<E extends BaseEntity>(
        condition: QueryCondition<E>,
        filters?: CommonQueryDto["filters"],
    ) {
        if (!filters || filters?.length === 0) {
            return condition;
        }
        const res: { $and: any[] } = { $and: [condition].filter(Boolean) };
        filters.forEach((item) => {
            let component: any;
            switch (item.operator) {
                case OperatorType.CONTAIN: {
                    component = {
                        [item.field]: {
                            $regex: item.values?.[0],
                            $options: "i",
                        },
                    };
                    break;
                }
                case OperatorType.NOT_CONTAIN: {
                    component = {
                        [item.field]: {
                            $not: { $regex: item.values?.[0], $options: "i" },
                        },
                    };
                    break;
                }
                case OperatorType.START_WITH: {
                    component = {
                        [item.field]: {
                            $regex: `^${item.values?.[0]?.toString()}`,
                            $options: "i",
                        },
                    };
                    break;
                }
                case OperatorType.END_WITH: {
                    component = {
                        [item.field]: {
                            $regex: `${item.values?.[0]?.toString()}$`,
                            $options: "i",
                        },
                    };
                    break;
                }
                case OperatorType.EQUAL: {
                    component = { [item.field]: item.values?.[0] };
                    break;
                }
                case OperatorType.NOT_EQUAL: {
                    component = { [item.field]: { $ne: item.values?.[0] } };
                    break;
                }
                case OperatorType.LESS_EQUAL: {
                    component = { [item.field]: { $lte: item.values?.[0] } };
                    break;
                }
                case OperatorType.LESS_THAN: {
                    component = { [item.field]: { $lt: item.values?.[0] } };
                    break;
                }
                case OperatorType.GREAT_EQUAL: {
                    component = { [item.field]: { $gte: item.values?.[0] } };
                    break;
                }
                case OperatorType.GREAT_THAN: {
                    component = { [item.field]: { $gt: item.values?.[0] } };
                    break;
                }
                case OperatorType.BETWEEN: {
                    component = {
                        [item.field]: {
                            $gte: item.values?.[0],
                            $lte: item.values?.[1],
                        },
                    };
                    break;
                }
                case OperatorType.NOT_BETWEEN: {
                    component = {
                        [item.field]: {
                            $not: {
                                $gte: item.values?.[0],
                                $lte: item.values?.[1],
                            },
                        },
                    };
                    break;
                }
                case OperatorType.INCLUDE: {
                    component = {
                        [item.field]: {
                            $in: item.values,
                        },
                    };
                    break;
                }
                case OperatorType.NOT_INCLUDE: {
                    component = {
                        [item.field]: {
                            $nin: item.values,
                        },
                    };
                    break;
                }
                case OperatorType.NOT_NULL: {
                    component = {
                        [item.field]: {
                            $exists: true,
                        },
                    };
                }
                case OperatorType.NULL: {
                    component = {
                        $or: [
                            {
                                [item.field]: {
                                    $exists: false,
                                },
                            },
                            { [item.field]: null },
                        ],
                    };
                }
                case OperatorType.LIKE: {
                    component = {
                        [item.field]: {
                            $regex: item.values?.[0],
                            $options: "i",
                        },
                    };
                    break;
                }
                case OperatorType.NOT_LIKE: {
                    component = {
                        [item.field]: {
                            $not: { $regex: item.values?.[0], $options: "i" },
                        },
                    };
                    break;
                }
                default: {
                    break;
                }
            }
            if (component) {
                res.$and.push(component);
            }
        });
        return res.$and.length > 0 ? res : {};
    }
}

export const MongoUtil: MongoUtilLoader =
    global.MongoUtil || (global.MongoUtil = new MongoUtilLoader());
