/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    CountQuery,
    DeleteManyQuery,
    DeleteOneQuery,
    ExistQuery,
    GetBatchQuery,
    GetByIdQuery,
    GetManyQuery,
    GetOneQuery,
    GetPageQuery,
    UpdateByIdQuery,
    UpdateManyQuery,
    UpdateOneQuery,
} from "@common/constant";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { ExportQueryDto } from "@common/dto/export-query.dto";
import { PageableDto } from "@common/dto/pageable.dto";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { MongoUtil } from "@common/utils/mongo.util";
import { ObjectUtil } from "@common/utils/object.util";
import {
    BaseCommandOption,
    BaseQueryOption,
    BaseRepository,
    BaseRepositoryOption,
    CreateDocument,
} from "@module/repository/common/base-repository.interface";
import { ClientSession } from "mongodb";
import { FilterQuery, Model, UpdateQuery } from "mongoose";

export abstract class MongoRepository<E extends BaseEntity>
    implements BaseRepository<E, ClientSession>
{
    constructor(
        private readonly model: Model<E>,
        private readonly option: BaseRepositoryOption = {},
    ) {}

    async create(
        document: CreateDocument<E>,
        options?: BaseCommandOption<ClientSession>,
    ): Promise<E> {
        if (!options?.transaction) {
            return this.model.create(document);
        } else {
            const res = await this.model.create([document], {
                session: options.transaction,
            });
            return res[0];
        }
    }

    async insertMany(
        documents: E[],
        options?: BaseCommandOption<ClientSession>,
    ): Promise<{ n: number }> {
        const res = await this.model.insertMany(documents, {
            rawResult: true,
            ordered: true,
            session: options?.transaction,
        });
        return { n: res.insertedCount };
    }

    getById(
        id: string,
        query?: GetByIdQuery & BaseQueryOption<ClientSession>,
    ): Promise<E> {
        const mongooseOptions = this.getMongooseOption(query);
        return this.model
            .findById(id)
            .populate<any>(
                MongoUtil.getPopulate(
                    query?.population || this.option.populate?.getById,
                ),
            )
            .setOptions({ ...mongooseOptions, session: query?.transaction })
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    getOne(
        conditions: FilterQuery<E>,
        query?: GetOneQuery & BaseQueryOption<ClientSession>,
    ): Promise<E> {
        const mongooseOptions = this.getMongooseOption(query);
        return this.model
            .findOne(MongoUtil.getCondition(conditions, query?.filters))
            .populate<any>(
                MongoUtil.getPopulate(
                    query?.population || this.option.populate?.getOne,
                ),
            )
            .setOptions({ ...mongooseOptions, session: query?.transaction })
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    getMany(
        conditions: FilterQuery<E>,
        query?: GetManyQuery & BaseQueryOption<ClientSession>,
    ): Promise<E[]> {
        const mongooseOptions = this.getMongooseOption(query);
        return this.model
            .find(MongoUtil.getCondition(conditions, query?.filters))
            .populate<any>(
                MongoUtil.getPopulate(
                    query?.population || this.option.populate?.getMany,
                ),
            )
            .setOptions({ ...mongooseOptions, session: query?.transaction })
            .lean({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    async getPage(
        conditions: FilterQuery<E>,
        query?: GetPageQuery & BaseQueryOption<ClientSession>,
    ): Promise<PageableDto<any>> {
        const mongooseOptions = this.getMongooseOption(query);
        const finalCondition = MongoUtil.getCondition(
            conditions,
            query?.filters,
        );
        const [total, result] = await Promise.all([
            this.count(finalCondition),
            this.model
                .find(finalCondition)
                .populate<any>(
                    MongoUtil.getPopulate(
                        query?.population || this.option.populate?.getPage,
                    ),
                )
                .setOptions({
                    ...mongooseOptions,
                    session: query?.transaction,
                })
                .lean({ defaults: true, getter: true, virtual: true }),
        ]);
        return PageableDto.create(query, total, result);
    }

    async *getBatch(
        conditions: any,
        query?: GetBatchQuery & BaseQueryOption<ClientSession>,
    ): AsyncGenerator<E[], undefined, undefined> {
        let previousId: string;
        const mongooseOptions = this.getMongooseOption(query);
        while (true) {
            if (previousId) {
                Object.assign(conditions, { _id: { $gt: previousId } });
            }
            const res = await this.model
                .find(conditions)
                .populate(
                    MongoUtil.getPopulate(
                        query?.population || this.option.populate?.getBatch,
                    ),
                )
                .setOptions({
                    ...mongooseOptions,
                    session: query?.transaction,
                })
                .lean<E[]>({ defaults: true, getter: true, virtual: true });
            if (res.length > 0) {
                yield res;
                previousId = res[res.length - 1]._id;
            } else {
                return;
            }
        }
    }

    async distinct<Type = any>(
        field: string,
        conditions?: any,
    ): Promise<Type[]> {
        return this.model.distinct<Type>(field, conditions);
    }

    updateById(
        id: string,
        update: UpdateQuery<E>,
        query?: UpdateByIdQuery & BaseCommandOption<ClientSession>,
    ): Promise<E> {
        const { transaction, ...options } = query || {};
        return this.model
            .findByIdAndUpdate(id, update, { ...options, session: transaction })
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    updateOne(
        conditions: FilterQuery<E>,
        update: UpdateQuery<E>,
        query?: UpdateOneQuery & BaseCommandOption<ClientSession>,
    ): Promise<E> {
        const { transaction, ...options } = query || {};
        return this.model
            .findOneAndUpdate(
                MongoUtil.getCondition(conditions, query?.filters),
                update,
                {
                    ...options,
                    session: transaction,
                },
            )
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    async updateMany(
        conditions: FilterQuery<E>,
        update: UpdateQuery<E>,
        query?: UpdateManyQuery & BaseCommandOption<ClientSession>,
    ): Promise<{ n?: number; affected: number }> {
        const { transaction, ...options } = query || {};
        const res = await this.model.updateMany(
            MongoUtil.getCondition(conditions, query?.filters),
            update,
            {
                ...options,
                session: transaction,
            },
        );
        const affected = res.modifiedCount + res.upsertedCount;
        return { n: res.matchedCount, affected };
    }

    deleteById(
        id: string,
        options?: BaseCommandOption<ClientSession>,
    ): Promise<E> {
        const { transaction } = options || {};
        return this.model
            .findByIdAndDelete(id, { session: transaction })
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    deleteOne(
        conditions: FilterQuery<E>,
        query?: DeleteOneQuery & BaseCommandOption<ClientSession>,
    ): Promise<E> {
        const { transaction, ...options } = query || {};
        return this.model
            .findOneAndDelete(
                MongoUtil.getCondition(conditions, query?.filters),
                {
                    ...options,
                    session: transaction,
                },
            )
            .lean<E>({ defaults: true, getter: true, virtual: true })
            .exec();
    }

    async deleteMany(
        conditions: FilterQuery<E>,
        query?: DeleteManyQuery & BaseCommandOption<ClientSession>,
    ): Promise<{
        n?: number;
        deleted: number;
    }> {
        const { transaction } = query || {};
        const res = await this.model.deleteMany(
            MongoUtil.getCondition(conditions, query?.filters),
            {
                session: transaction,
            },
        );
        return { deleted: res.deletedCount };
    }

    async exists(
        conditions?: FilterQuery<E>,
        query?: ExistQuery & BaseQueryOption<ClientSession>,
    ): Promise<boolean> {
        const res = await this.model
            .exists(MongoUtil.getCondition(conditions, query?.filters))
            .session(query?.transaction);
        return Boolean(res?._id);
    }

    count(
        conditions?: any,
        query?: CountQuery & BaseQueryOption<ClientSession>,
    ): Promise<number> {
        const finalCondition = MongoUtil.getCondition(
            conditions,
            query?.filters,
        );
        if (
            ObjectUtil.isEmptyObject(finalCondition) &&
            !this.model.baseModelName
        ) {
            return this.model
                .estimatedDocumentCount({ session: query?.transaction })
                .exec();
        } else {
            return this.model
                .countDocuments(finalCondition, { session: query?.transaction })
                .exec();
        }
    }

    getMongooseOption(query: CommonQueryDto) {
        const option: any = {};
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (["select", "sort", "skip", "limit"].includes(key)) {
                    option[key] = value;
                }
            });
        }
        return option;
    }

    async getExport(
        condition: any,
        query: CommonQueryDto,
        exportQuery: ExportQueryDto & BaseQueryOption<ClientSession>,
    ): Promise<E[]> {
        // TODO: Implement mongo get export
        return null;
    }

    getRepositoryErrors(err: Error): string[] {
        throw new Error("Method not implemented.");
    }
}
