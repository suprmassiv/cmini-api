import { CminiLayout, CminiStats, CminiStatsByCorpora, CminiMetric, CminiMeta, CminiHeatmap, CminiBoardLayout, CminiBoardType } from "./types";
import { decodeKeys } from "../../util/layout";
import { CsvLoader } from "../FileLoader";

class CminiStore {
  stats: Map<string, CminiStatsByCorpora> = new Map()
  layouts: Map<string, CminiLayout> = new Map()
  boardLayouts: Map<string, CminiBoardLayout> = new Map()
  meta: Map<string, CminiMeta> = new Map()
  heatmaps: Map<string, CminiHeatmap> = new Map()
  metrics: Map<string, CminiMetric> = new Map()
  keymap: Map<string, string[]> = new Map()
  corpora: string[] = []

  indexes: { [key: string]: { [key: string]: string } } = {
    name: {},
    author: {}
  }

  authorIdToLayoutHashes: Map<string, string[]> = new Map()
  authorIdToBoardHashes: Map<string, string[]> = new Map()

  async load() {
    await this.loadLayout()
    console.log('Cached layouts')
    await this.loadMeta()
    console.log('Cached meta')
    await this.loadStats()
    console.log('Cached stats')
    await this.loadMetrics()
    console.log('Cached metrics')
    await this.loadHeatmap()
    console.log('Cached heatmap')
    await this.loadKeymap()
    console.log('Cached keymap')
  }

  protected async loadKeymap() {
    const data = await new CsvLoader('keymap.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        key, ids
      ] = line.split("¶");

      if (!this.keymap.has(key)) {
        this.keymap.set(key, [])
      }
      const ref = this.keymap.get(key)
      for (const id of ids.split(',')) {
        if (ref!.includes(id)) continue
        ref!.push(id)
      }
    }
  }

  protected async loadHeatmap() {
    const data = await new CsvLoader('heatmap.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        name, ...pairs
      ] = line.split("|");

      const parent = new Map<string, number>()
      this.heatmaps.set(name, parent)

      for (const pair of pairs) {
        const [charCode, frequency] = pair.split(',')
        if (typeof charCode === 'undefined' || charCode === '') {
          continue
        }
        parent.set(charCode, Number(frequency))
      }
    }
  }

  protected async loadMetrics() {
    const data = await new CsvLoader('metrics.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        name,
        min,
        max
      ] = line.split("|");

      const metric: CminiMetric = {
        min: Number(min), max: Number(max), name
      }
      this.metrics.set(name, metric)
    }
  }

  protected async loadMeta() {
    const data = await new CsvLoader('names.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        name,
        layoutHash,
        boardHash,
        metaHash,
        author,
        authorId,
        likes,
        link,
      ] = line.split("|");
      if (!layoutHash) {
        continue
      }

      const meta: CminiMeta = {
        name,
        layoutHash,
        boardHash,
        metaHash,
        authorId,
        author,
        likes: Number(likes),
        link,
      };

      this.meta.set(metaHash, meta)

      this.indexes.name[name] = boardHash
      this.indexes.author[authorId] = author
      this.indexes.author[author] = authorId

      if (!this.authorIdToLayoutHashes.has(authorId)) {
        this.authorIdToLayoutHashes.set(authorId, [])
      }
      const ref1 = this.authorIdToLayoutHashes.get(authorId)
      if (!ref1!.includes(layoutHash)) {
        ref1!.push(layoutHash)
      }

      if (!this.authorIdToBoardHashes.has(authorId)) {
        this.authorIdToBoardHashes.set(authorId, [])
      }
      const ref4 = this.authorIdToBoardHashes.get(authorId)
      if (!ref4!.includes(boardHash)) {
        ref4!.push(boardHash)
      }

      const ref2 = this.layouts.get(layoutHash)
      if (!ref2?.metaHashes.includes(metaHash)) {
        ref2?.metaHashes.push(metaHash)
      }

      const ref3 = this.boardLayouts.get(boardHash)
      if (!ref3?.metaHashes.includes(metaHash)) {
        ref3?.metaHashes.push(metaHash)
      }
    }
  }

  protected async loadLayout() {
    const data = await new CsvLoader('layouts.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        layoutHash,
        boardHash,
        board,
        keysStr
      ] = line.split("|");
      if (!layoutHash) {
        continue
      }

      if (!this.layouts.has(layoutHash) ) {
        const layout: CminiLayout = {
          layoutHash,
          keys: decodeKeys(keysStr),
          boardHashes: [],
          metaHashes: [],
          encodedKeys: keysStr
        };
        this.layouts.set(layoutHash, layout)
      }
      const ref1 = this.layouts.get(layoutHash)
      ref1!.boardHashes.push(boardHash)

      if (!this.boardLayouts.has(boardHash) ) {
        const layout: CminiBoardLayout = {
          layoutHash,
          boardHash,
          board: Number(board) as CminiBoardType,
          metaHashes: []
        };
        this.boardLayouts.set(boardHash, layout)
      }
    }
  }

  protected async loadStats() {
    const data = await new CsvLoader('stats.csv').load()
    if (!data) return;
    for await (const line of data) {
      const [
        layoutHash,
        boardHash,
        corpora,
        alternate,
        rollIn,
        rollOut,
        oneIn,
        oneOut,
        redirect,
        badRedirect,
        sfb,
        sfs,
        sfsAlt,
        fsb,
        hsb,
        pinkyOff,
        rightRing,
        leftMiddle,
        rightMiddle,
        leftPinky,
        rightPinky,
        leftIndex,
        rightIndex,
        leftRing,
        leftHand,
        rightHand,
        leftThumb,
        rightThumb,
      ] = line.split("|");
      if (!layoutHash) {
        continue
      }

      const stats: CminiStats = {
        corpora,
        layoutHash: layoutHash,
        boardHash,
        alternate: Number(alternate),
        rollIn: Number(rollIn),
        rollOut: Number(rollOut),
        oneIn: Number(oneIn),
        oneOut: Number(oneOut),
        redirect: Number(redirect),
        badRedirect: Number(badRedirect),
        sfb: Number(sfb),
        sfs: Number(sfs),
        sfsAlt: Number(sfsAlt),
        leftHand: Number(leftHand),
        rightHand: Number(rightHand),
        fsb: Number(fsb),
        hsb: Number(hsb),
        pinkyOff: Number(pinkyOff),
        fingers: {
          rightRing: Number(rightRing),
          leftRing: Number(leftRing),
          rightIndex: Number(rightIndex),
          leftIndex: Number(leftIndex),
          rightMiddle: Number(rightMiddle),
          leftMiddle: Number(leftMiddle),
          rightPinky: Number(rightPinky),
          leftPinky: Number(leftPinky),
          leftThumb: Number(leftThumb ?? 0),
          rightThumb: Number(rightThumb ?? 0),
        },
      };
      if (!this.stats.has(boardHash)) {
        this.stats.set(boardHash, new Map<string, CminiStats>())
      }
      const ref = this.stats.get(boardHash)
      ref!.set(corpora, stats)

      if (!(this.corpora.includes(corpora))) {
        this.corpora.push(corpora)
      }
    }
  }
}

const instance = new CminiStore();
await instance.load();
export default instance;
