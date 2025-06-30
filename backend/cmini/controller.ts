
import CminiStore from './store'
import { CminiLayout, CminiBoardLayout } from './types'

class CminiController {
  getCorpora() {
    return CminiStore.corpora
  }

  getMetric(name: string) {
    return CminiStore.metrics.get(name)
  }

  getHeatmap(corpora: string) {
    const ref = CminiStore.heatmaps.get(corpora)
    if (!ref) return undefined;

    return Object.fromEntries(ref.entries())
  }

  getAuthorName(id: string) {
    return CminiStore.indexes.author[id]
  }

  getBoardHashes() {
    const hashes: string[] = []
    for (const corpora of Array.from(CminiStore.boardLayouts.entries())) {
      for (const item of corpora) {
        const layout = item as CminiBoardLayout
        if (!hashes.includes(layout.boardHash) && !!layout.boardHash) {
          hashes.push(layout.boardHash)
        }
      }
    }
    return hashes
  }

  getLayoutHashes() {
    const hashes: string[] = []
    for (const corpora of Array.from(CminiStore.layouts.entries())) {
      for (const item of corpora) {
        const layout = item as CminiLayout
        if (!hashes.includes(layout.layoutHash) && !!layout.layoutHash) {
          hashes.push(layout.layoutHash)
        }
      }
    }
    return hashes
  }

  getLayoutNames() {
    const names: string[] = []
    for (const boardLayout of Array.from(CminiStore.boardLayouts.values())) {
      for (const metaHash of boardLayout.metaHashes) {
        const meta = CminiStore.meta.get(metaHash)!
        if (!names.includes(meta.name)) {
          names.push(meta.name)
        }
      }
    }
    return names
  }

  getAuthorNames() {
    const names: string[] = []
    for (const meta of Array.from(CminiStore.meta.values())) {
      if (!names.includes(meta.author)) {
        names.push(meta.author)
      }
    }
    return names
  }

  getAuthorIds() {
    const names: string[] = []
    for (const meta of Array.from(CminiStore.meta.values())) {
      if (!names.includes(meta.authorId)) {
        names.push(meta.authorId)
      }
    }
    return names
  }

  getLayoutByBoardHash(boardHash: string) {
    const boardLayout = CminiStore.boardLayouts.get(boardHash)
    if (!boardLayout) {
      return undefined
    }
    return {
      layout: CminiStore.layouts.get(boardLayout.layoutHash)!,
      boardLayouts: [this.getBoardLayoutDetails(boardLayout)]
    }
  }

  getLayoutByHash(hash: string) {
    const layout = CminiStore.layouts.get(hash)
    if (!layout) {
      return undefined
    }

    const boardLayouts = layout?.boardHashes.map(boardHash => CminiStore.boardLayouts.get(boardHash)!)
    return {
      boardLayouts, layout
    }
  }

  getBoardLayoutDetails(board: CminiBoardLayout) {
    const {metaHashes,...props} = board
    return {
      ...props,
      stats: CminiStore.stats.get(board.boardHash)!,
      meta: this.getMetas(metaHashes)!
    }
  }

  getBoardLayoutByBoardHash(boardHash:string) {
    const boardLayout = CminiStore.boardLayouts.get(boardHash)
    if (!boardLayout) {
      return undefined
    }
    return this.getBoardLayoutDetails(boardLayout)
  }

  getLayoutByName(name: string) {
    const boardHash = CminiStore.indexes.name[name]
    if (!boardHash) {
      return undefined
    }
    return this.getLayoutByBoardHash(boardHash)
  }

  getBoardLayoutByName(name: string) {
    const boardHash = CminiStore.indexes.name[name]
    if (!boardHash) {
      return undefined
    }
    return this.getBoardLayoutByBoardHash(boardHash)
  }

  getBoardLayoutsByCorpora(corpora: string) {
    if (!CminiStore.corpora.includes(corpora)) {
      return []
    }
    return Array.from(CminiStore.boardLayouts.values()).map(boardLayout => {
      const layout = CminiStore.layouts.get(boardLayout.layoutHash)!
      const {stats, ...details} = this.getBoardLayoutDetails(boardLayout)
      return {
        layout,
        ...details,
        stats: stats.get(corpora)!
      }
    })
  }

  getBoardLayoutsByAuthorName(name: string) {
    const id = CminiStore.indexes.author[name]
    if (!id) {
      return []
    }
    return this.getBoardLayoutsByAuthorId(id)
  }

  getMetas(hashes: string[]) {
    return hashes.map(hash => CminiStore.meta.get(hash)).filter(hash => (!!hash))
  }

  getBoardLayoutsByAuthorId(id: string) {
    const boardHashes = CminiStore.authorIdToBoardHashes.get(id) || [];
    return boardHashes.map(boardLayoutHash => {
      const boardLayout = CminiStore.boardLayouts.get(boardLayoutHash)!
      const layout = CminiStore.layouts.get(boardLayout.layoutHash)!
      const details = this.getBoardLayoutDetails(boardLayout)
      return {
        layout,
        boardLayout: details,
        meta: details.meta.find(meta => meta.authorId === id)!
      }
    })
  }

  getKeymap(key: string) {
    return CminiStore.keymap.get(key)
  } 
}

const instance = new CminiController();
export default instance;