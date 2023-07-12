import { PageableDto } from "@common/dto/pageable.dto";
import { applyDecorators, Controller, HttpStatus, Type } from "@nestjs/common";
import {
    ApiExtraModels,
    ApiQuery,
    ApiResponse,
    getSchemaPath,
} from "@nestjs/swagger";
import { ResponseDataDto } from "../dto/response-data.dto";
import { ResponseErrorDto } from "../dto/response-error.dto";

export const ApiRecordResponse = <T extends Type<any>>(
    model: T,
    status: HttpStatus = HttpStatus.OK,
) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                $ref: getSchemaPath(ResponseDataDto),
                properties: {
                    data: {
                        $ref: getSchemaPath(model),
                    },
                },
            },
        }),
        ApiExtraModels(ResponseDataDto, model),
    );
};

export const ApiListResponse = <T extends Type<any>>(
    model: T,
    status: HttpStatus = HttpStatus.OK,
) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(ResponseDataDto) },
                    {
                        properties: {
                            data: {
                                type: "array",
                                items: {
                                    $ref: getSchemaPath(model),
                                },
                            },
                        },
                    },
                ],
            },
        }),
        ApiExtraModels(ResponseDataDto, model),
    );
};

export const ApiPageResponse = <T extends Type<any>>(
    model: T,
    status: HttpStatus = HttpStatus.OK,
) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                $ref: getSchemaPath(ResponseDataDto),
                properties: {
                    data: {
                        $ref: getSchemaPath(PageableDto),
                        properties: {
                            result: {
                                type: "array",
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                },
            },
        }),
        ApiExtraModels(ResponseDataDto, PageableDto, model),
    );
};

export const ApiStringResponse = (status: HttpStatus = HttpStatus.OK) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                $ref: getSchemaPath(ResponseDataDto),
                properties: {
                    data: {
                        type: "string",
                    },
                },
            },
        }),
    );
};

export const ApiNumberResponse = (status: HttpStatus = HttpStatus.OK) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                $ref: getSchemaPath(ResponseDataDto),
                properties: {
                    data: {
                        type: "number",
                    },
                },
            },
        }),
    );
};

export const ApiBoolResponse = (status: HttpStatus = HttpStatus.OK) => {
    return applyDecorators(
        ApiResponse({
            status,
            schema: {
                $ref: getSchemaPath(ResponseDataDto),
                properties: {
                    data: {
                        type: "boolean",
                    },
                },
            },
        }),
    );
};

export const ApiCondition = () =>
    applyDecorators(
        ApiQuery({ name: "condition", type: String, required: false }),
        ApiQuery({ name: "filters[]", type: Array, required: false }),
    );

export const ApiGet = (
    props: { mode: "default" | "page" | "many" } = { mode: "default" },
) => {
    const decorators: MethodDecorator[] = [];
    switch (props.mode) {
        case "default":
        case "page": {
            decorators.push(
                ApiQuery({
                    name: "page",
                    required: false,
                    example: 1,
                }),
                ApiQuery({
                    name: "limit",
                    required: false,
                    example: 20,
                }),
            );
            break;
        }
        case "many": {
            break;
        }
    }
    decorators.push(
        ApiQuery({
            name: "select",
            required: false,
            examples: {
                Default: {
                    value: "",
                },
                Include: {
                    value: "createdAt updatedAt",
                },
                Exclude: {
                    value: "-createdAt -updatedAt",
                },
            },
        }),
        ApiQuery({
            name: "sort",
            required: false,
            examples: {
                Default: {
                    value: "",
                },
                Sort: {
                    value: "createdAt -updatedAt",
                },
            },
        }),
    );
    return applyDecorators(...decorators);
};

type ErrorData = Pick<ResponseErrorDto, "code" | "message">;

const getDoc = (errors: ErrorData[]) =>
    `<table><thead><tr><th>Code</th><th>Message</th></tr></thead><tbody>${errors
        .map((e) => `<tr><td>${e.code}</td><td>${e.message}</td></tr>`)
        .join("")}</tbody></table>`;

export const ApiErrorDoc = (statusCode: HttpStatus, ...errors: ErrorData[]) =>
    ApiResponse({
        status: statusCode,
        description: getDoc(errors),
        type: ResponseErrorDto,
    });

export const PublicController = (name: string | string[]) => {
    if (Array.isArray(name)) {
        return Controller(name.map((n) => `${n}/public`));
    } else {
        return Controller(`${name}/public`);
    }
};
