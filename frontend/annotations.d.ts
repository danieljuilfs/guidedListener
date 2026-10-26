export interface ListeningMap {
    title: string;
    composer: string;
    album: string;
    performer: string;
    trackid: number;
    uri: string;
    duration: number;
    sections: section[];
    comments: comment[];
    keys: key[];
    listenerType: string;
}
export interface comment {
    commentNumber: number;
    startTime: number;
    lyrics?: string;
    translation?: string;
    notes?: string;
}
export interface key {
    keyNumber: number;
    startTime: number;
    text: string;
}
export interface section {
    sectionNumber: number;
    measure: string;
    sectionName: string;
    startTime: number;
    endTime: number;
    lyrics?: string;
    translation?: string;
    notes?: string;
}
export declare function createAnnotations(request: ListeningMap): void;
export declare function getAnnotations(): ListeningMap;
export declare function getNotes(): string[];
export declare function getEnds(): number[];
//# sourceMappingURL=annotations.d.ts.map