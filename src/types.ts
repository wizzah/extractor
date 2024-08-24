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
    chunkProgress: number,
    activeProcessing: boolean,
    rateLimitTime: number
  }