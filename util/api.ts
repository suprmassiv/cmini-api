export function meta<T>(rows: Array<T>, page = 1, limit = 25) {
    const totalRows = rows.length
    const cursor = limit * (page - 1)
    const quotient = Math.floor(totalRows / limit)
    const remainder = totalRows % (limit * page)
    const totalPages = remainder === 0 ? quotient : quotient + 1
    const hasMore = page < totalPages
    const nextRows = rows.slice(cursor, cursor + limit)
    const currentRows = nextRows.length

    return {
        rows: nextRows, 
        page, limit, hasMore, cursor, totalPages, totalRows, currentRows
    }
}