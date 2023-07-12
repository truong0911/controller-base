import { ClientCommonQuery } from "@common/constant/class/client-common-query";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class RequestQueryPipe
    implements PipeTransform<ClientCommonQuery, Promise<CommonQueryDto>>
{
    async transform(value: ClientCommonQuery): Promise<CommonQueryDto> {
        const param = plainToClass(ClientCommonQuery, value);
        const errors = await validate(param);
        if (errors.length > 0) {
            throw new BadRequestException("Invalid client query");
        }

        const { select, sort, limit, page, skip, filters } = value;
        try {
            const parsedPage = page && parseInt(page, 10);
            const parsedLimit = limit && parseInt(limit, 10);
            const parsedSkip = skip && parseInt(skip, 10);
            const calculatedSkip =
                parsedSkip ??
                (parsedPage && parsedLimit && (parsedPage - 1) * parsedLimit);

            const parsedSelect =
                select &&
                select.split(/\s+/).reduce((selectOpts, field) => {
                    const remove = field.startsWith("-");
                    if (remove) {
                        const newField = field.substring(1);
                        selectOpts[newField] = 0;
                    } else {
                        selectOpts[field] = 1;
                    }
                    return selectOpts;
                }, {});

            const parsedSort = (sort && JSON.parse(sort)) || {};
            if (!("_id" in parsedSort)) {
                Object.assign(parsedSort, { _id: -1 });
            }

            const parsedFilters =
                (filters && filters.map((filter) => JSON.parse(filter))) || [];

            const res: CommonQueryDto = {
                page: parsedPage,
                limit: parsedLimit,
                skip: calculatedSkip,
                select: parsedSelect,
                sort: parsedSort,
                filters: parsedFilters,
            };
            return res;
        } catch (err) {
            throw new BadRequestException("Error parsing client query");
        }
    }
}
