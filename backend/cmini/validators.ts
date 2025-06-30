import * as z from "zod/v4";
import CminiController from "./controller";
import { CminiBoardType } from "./types";

export const SearchSchema = z.object({
    corpora: z.enum(CminiController.getCorpora()).optional(),
    name: z.string().min(1).max(255).optional(),
    author: z.string().min(1).max(32).optional(),
    query: z.string().optional(),
    board: z.enum(CminiBoardType).optional(),
    minSfb: z.number().gte(0).optional(),
    maxSfb: z.number().lte(10).optional(),
    keyQuery: z.string().min(2).max(55).optional(),

    sortBy: z.enum(['sfb']).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
    limit: z.number().gt(0).lte(50).optional(),
    page: z.number().gt(0).optional()
})