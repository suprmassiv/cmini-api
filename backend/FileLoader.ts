import fs from 'fs/promises'
import fss from 'fs'
import readline from 'readline'
import path from 'path'

export enum FileType {
    Json,
    Csv
}

type FileLoader<T> = {
    load(): Promise<T | undefined>
    get(): T
    type(): FileType
}

class StringLoader implements FileLoader<string> {
    protected data: string;
    protected path: string;
    protected filetype: FileType

    constructor(path: string, filetype: FileType) {
        this.path = path;
        this.filetype = filetype;
    }

    async load() {
        const fullPath = path.resolve(process.cwd(), this.path)
        const buffer = await fs.readFile(fullPath)
        this.data = buffer.toString('utf-8')
        return this.data
    }

    get() {
        return this.data
    }

    type() {
        return this.filetype
    }
}

class StringLoaderSequential implements FileLoader<readline.Interface> {
    protected iterator: readline.Interface;
    protected path: string;
    protected filetype: FileType

    constructor(path: string, filetype: FileType) {
        this.path = path;
        this.filetype = filetype;
    }

    async load() {
        const fullPath = path.resolve(process.cwd(), this.path)
        const fileStream = fss.createReadStream(fullPath);
        this.iterator = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        return this.iterator
    }

    get() {
        return this.iterator
    }

    type() {
        return this.filetype
    }
}

export class CsvLoader implements FileLoader<readline.Interface> {
    protected loader: StringLoaderSequential
    protected data: readline.Interface

    constructor(path: string) {
        this.loader = new StringLoaderSequential(path, FileType.Csv)
    }

    async load() {
        try {
            this.data = await this.loader.load()
            return this.data
        } catch {
            return undefined
        }
    }

    get() {
        return this.data
    }

    type() {
        return this.loader.type()
    }
}

export class JsonLoader<T> implements FileLoader<T> {
    protected loader: StringLoader
    protected data: T

    constructor(path: string) {
        this.loader = new StringLoader(path, FileType.Json)
    }

    async load() {
        try {
            const data = await this.loader.load()
            this.data = JSON.parse(data) as T
            return this.data
        } catch {
            return undefined
        }
    }

    get() {
        return this.data
    }

    type() {
        return this.loader.type()
    }
}