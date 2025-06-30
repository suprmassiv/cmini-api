import * as z from "zod/v4"; 
import CminiController from '@backend/cmini/controller'
import { parseQuery } from '@util/url';

const schema = z.object({
    name: z.string().min(1).max(32).optional(),
    id: z.number().gte(16).lte(20).optional()
})

export async function GET(req) {
    const queryObj = parseQuery(req.url!)
    const validation = schema.safeParse(queryObj)
    if (validation.error) {
        return Response.json({
            error: validation.error!.issues,
            success: false
        })
    }

    const { name, id } = queryObj
    let rows: any;
    if (!!name) {
        rows = CminiController.getBoardLayoutsByAuthorName(name as string)
    } else if (!!id) {
        rows = CminiController.getBoardLayoutsByAuthorId(id as string)
    } else {
        return Response.json({
            success: false
        })
    }

    return Response.json({
        data: rows,
        success: true
    })
}