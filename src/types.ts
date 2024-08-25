type Outline = {
    [key: string]: string;
}

export type ExtractedJson = {
    title: string,
    entities: string[],
    summary: string,
    outline: Outline
}

export type ChunkData = {
    totalChunks: number,
    activeProcessing: boolean,
    rateLimitTime: number,
    title: string,
    queryString: string[],
    batchNumber: number
  }