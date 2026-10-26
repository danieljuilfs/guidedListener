interface section {
    sectionNumber: number;
    measure: string;
    sectionName: string;
    startTime: number;
    endTime: number;
    lyrics?: string;
    translation?: string;
    notes?: string;
}
interface comment {
    commentNumber: number;
    startTime: number;
    lyrics?: string;
    translation?: string;
    notes?: string;
}
interface key {
    keyNumber: number;
    startTime: number;
    text: string;
}
export interface ListeningMap {
    album: string;
    trackid: number;
    uri: string;
    duration: number;
    performer: string;
    title: string;
    composer: string;
    sections: section[];
    comments: comment[];
    keys: key[];
    type: string;
}
export declare function read(id: number): Promise<Object | null>;
export declare function create(listen: ListeningMap): Promise<number>;
export {};
//# sourceMappingURL=dbaccess.d.ts.map