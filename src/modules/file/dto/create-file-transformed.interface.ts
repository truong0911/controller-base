import { File } from "../entities/file.entity";

export type CreateFileTransformedDto = Pick<File, "isPublic">;
