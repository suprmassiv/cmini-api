import { parseQuery } from '@util/url';
import { meta } from '@util/api';
import CminiApi from "../../../backend/cmini/api";
import { SearchSchema } from '@backend/cmini/validators';

export async function GET(req) {
    const queryObj = parseQuery(req.url!)
    const validation = SearchSchema.safeParse(queryObj)
    if (validation.error) {
        return Response.json({
            error: validation.error!.issues,
            success: false
        })
    }

    const result = CminiApi.search(queryObj as any)
    const { rows, cursor, ...metas } = meta(result, queryObj?.page as number, queryObj?.limit as number)

    return Response.json({
        data: rows,
        success: true,
        meta: metas
    })
}