import { applyDecorators } from "@nestjs/common";
import { Prop } from "@nestjs/mongoose";
import { compare, hash } from "bcryptjs";
import { Response } from "express";
import { Types } from "mongoose";

export type ObjectID = Types.ObjectId;
export const ObjectID = Types.ObjectId;

export const StrObjectId = () =>
    applyDecorators(
        Prop({ type: String, default: () => new ObjectID().toString() }),
    );

export const createUserPassword = async (password: string) =>
    hash(password, 10);
export const compareUserPassword = async (
    password: string,
    hashPassword: string,
) => compare(password, hashPassword);

export const MAX_TOPIC_SUBSCRIPTION = 5000;

export enum QueueName {
    ONE_SIGNAL = "OneSignal",
}

export enum OperatorType {
    EQUAL = "eq",
    NOT_EQUAL = "ne",
    CONTAIN = "contain",
    NOT_CONTAIN = "not_contain",
    LIKE = "like",
    NOT_LIKE = "not_like",
    START_WITH = "start",
    END_WITH = "end",
    LESS_EQUAL = "lte",
    GREAT_EQUAL = "gte",
    LESS_THAN = "lt",
    GREAT_THAN = "gt",
    BETWEEN = "between",
    NOT_BETWEEN = "not_between",
    INCLUDE = "in",
    NOT_INCLUDE = "not_in",
    NOT_NULL = "not_null",
    NULL = "null",
}

export const AllowMimeTypes: Array<{ ext: string; type: string }> = [
    { ext: "webp", type: "image/webp" },
    { ext: "bmp", type: "image/bmp" },
    { ext: "jpg", type: "image/jpg" },
    { ext: "jpeg", type: "image/jpeg" },
    { ext: "png", type: "image/png" },
    { ext: "gif", type: "image/gif" },
    { ext: "txt", type: "text/plain" },
    { ext: "pdf", type: "application/pdf" },
    { ext: "doc", type: "application/msword" },
    {
        ext: "docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    { ext: "xls", type: "application/vnd.ms-excel" },
    {
        ext: "xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    { ext: "ppt", type: "application/vnd.ms-powerpoint" },
    {
        ext: "pptx",
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
];

export enum ExportType {
    WORD = "word",
    PDF = "pdf",
    XLSX = "excel",
    ZIP = "zip",
}

export const exportFileHelper = (
    buffer: Buffer,
    filename: string,
    exportType: ExportType,
    res: Response,
) => {
    switch (exportType) {
        case ExportType.WORD: {
            res.setHeader(
                "Access-Control-Expose-Headers",
                "Content-Disposition",
            );
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
            res.setHeader(
                "Content-Disposition",
                `filename="${encodeURIComponent(filename)}.docx"`,
            );
            break;
        }
        case ExportType.PDF: {
            res.setHeader(
                "Access-Control-Expose-Headers",
                "Content-Disposition",
            );
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `filename="${encodeURIComponent(filename)}.pdf"`,
            );
            break;
        }
        case ExportType.XLSX: {
            res.setHeader(
                "Access-Control-Expose-Headers",
                "Content-Disposition",
            );
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            );
            res.setHeader(
                "Content-Disposition",
                `filename="${encodeURIComponent(filename)}.xlsx"`,
            );
            break;
        }
        case ExportType.ZIP: {
            res.setHeader(
                "Access-Control-Expose-Headers",
                "Content-Disposition",
            );
            res.setHeader("Content-Type", "application/zip");
            res.setHeader(
                "Content-Disposition",
                `filename="${encodeURIComponent(filename)}.zip"`,
            );
            break;
        }
    }
    res.end(buffer);
};
