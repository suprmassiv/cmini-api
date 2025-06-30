import Fuse from "fuse.js"
import CminiController from "./controller"
import { SortOrder } from "../../types"
import { CminiBoardType, CminiHand } from "./types"

export default class CminiApi {
    public static search(args: {
        corpora: string, query?: string, board?: CminiBoardType, sort?: SortOrder, sortBy?: string, minSfb?: number, maxSfb?: number, author?: string, authorId?: string, name?: string, keyQuery?: string
    }) {
        const { corpora = 'monkeyracer', query, board, sort = SortOrder.Ascending, sortBy = 'sfb', minSfb, maxSfb, author, name, authorId, keyQuery } = args
        let rows = CminiController.getBoardLayoutsByCorpora(corpora)

        const hasKeyQuery = typeof keyQuery !== 'undefined'
        if (hasKeyQuery) {
            const layoutHashes = this.keySearch(keyQuery)
            rows = rows.filter(row => layoutHashes.includes(row.layoutHash))
        }
        if (rows.length === 0) return []

        const hasSfb = typeof minSfb !== 'undefined' && typeof maxSfb !== 'undefined'
        const hasBoard = typeof board !== 'undefined'
        const hasAuthorId = typeof board !== 'undefined'
        const hasFilter = hasBoard || hasSfb || hasAuthorId
        if (hasFilter) {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                if (hasAuthorId) {
                    const authorIdExists = row.meta.some(meta => meta.authorId === authorId)
                    if (authorIdExists) {
                        rows.splice(i, 1)
                        i--
                    }
                } if (hasBoard && row.board !== board) {
                    rows.splice(i, 1)
                    i--
                } else if (hasSfb && row.stats.sfb >= (minSfb) && row.stats.sfb <= (maxSfb)) {
                    rows.splice(i, 1)
                    i--
                }
            }
        }
        if (rows.length === 0) return []

        const hasQuery = typeof query !== 'undefined' || typeof name !== 'undefined' || typeof author !== 'undefined'
        if (hasQuery) {
            let keys: string[] = []
            if (typeof query !== 'undefined') {
                keys = ['meta.name', 'meta.author']
            } else if (typeof name !== 'undefined') {
                keys = ['meta.name']
            } else if (typeof author !== 'undefined') {
                keys = ['meta.author']
            }
            const fuse = new Fuse(rows, {
                minMatchCharLength: 1,
                keys
            })
            rows = fuse.search(query as string).map(o => o.item)
        }
        if (rows.length === 0) return []

        const hasSort = !hasQuery && typeof sort !== 'undefined' && typeof sortBy !== 'undefined'
        if (hasSort) {
            rows = rows.sort((a, b) => {
                const first = sort === 'asc' ? a : b
                const second = sort === 'asc' ? b : a
                switch (sortBy) {
                    case 'sfb':
                        return first.stats.sfb - second.stats.sfb
                    default:
                        return 0
                }
            })
        }

        return rows
    }

    // reserved keys: | + :
    public static parseKeyQuery(query: string) {
        let hand = CminiHand.Left
        const commands: string[][] = []

        const queryTokens = query.split('+')
        if (queryTokens.length > 3) {
            return []
        }

        for (const queryToken of queryTokens) {
            if (queryToken === "") continue
            const hasHandSyntax = queryToken.includes('|')
            for (const handToken of queryToken.split('|')) {
                if (handToken !== "") {
                    for (let token of handToken.split(',')) {
                        if (token === "") {
                            continue
                        }

                        if (!token.includes(':')) {
                            token = ':' + token
                        }
                        const [modifier, letters] = token.split(':')
                        if (letters.length < 1 || letters.length > 4) {
                            continue
                        }

                        let key = ''
                        const hasModifier = modifier.length > 0
                        const shouldExpandHandSyntax = hasModifier && !hasHandSyntax
                        if (!shouldExpandHandSyntax) {
                            key = hand === CminiHand.Right ? '|' : ''
                        }

                        switch (modifier) {
                            case 'h':
                                key += 'h–'
                                break
                            case 'v':
                                key += 'v–'
                                break
                            case '':
                                // nop
                                break
                            default:
                                continue
                        }

                        key += letters
                        if (!shouldExpandHandSyntax) {
                            key += hand === CminiHand.Left ? '|' : ''
                        }

                        if (shouldExpandHandSyntax) {
                            // query contains a generic search on both hands
                            commands.push(['|' + key, key + '|'])
                        } else {
                            commands.push([key])
                        }
                    }
                }
                hand = hand === CminiHand.Left ? CminiHand.Right : CminiHand.Left
            }
        }
        return commands
    }

    public static keySearch(query: string) {
        let ids: string[] = []
        const commands = this.parseKeyQuery(query)
        for (let i = 0; i < commands.length; i++) {
            const commandList = commands[i]

            let keys: string[] = []
            let hasKeys = false
            for (const command of commandList) {
                const appendKeys = CminiController.getKeymap(command)
                if (appendKeys) {
                    keys = keys.concat(appendKeys)
                    hasKeys = true
                }
            }

            if (!hasKeys) {
                ids = []
                break
            }

            if (i === 0) {
                ids = keys
            } else {
                ids = ids.filter(id => keys.includes(id))
            }

            if (ids.length === 0) {
                break
            }
        }
        return ids
    }
}