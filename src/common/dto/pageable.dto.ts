import { ApiProperty } from "@nestjs/swagger";
import { CommonQueryDto } from "./common-query.dto";

export class PageableDto<T = any> {
    total: number;
    skip: number;
    limit: number;
    page: number;

    @ApiProperty()
    result: T[];

    constructor(
        page: number,
        skip: number,
        limit: number,
        total: number,
        result: T[],
    ) {
        Object.assign(this, {
            page,
            skip,
            limit,
            total,
            result,
        });
    }

    static create(
        query: CommonQueryDto,
        total: number,
        result: any[],
    ): PageableDto {
        return new PageableDto(
            query.page,
            query.skip,
            query.limit,
            total,
            result,
        );
    }
}
