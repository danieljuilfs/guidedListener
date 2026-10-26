interface section {
    sectionnumber: number;
    measure: string;
    sectionname: string;
    starttime: number;
    endtime: number;
    lyrics?: string | undefined;
    translation?: string | undefined;
    notes?: string | undefined;
}
interface comment {
    commentnumber: number;
    starttime: number;
    lyrics?: string | undefined;
    translation?: string | undefined;
    notes?: string | undefined;
}
interface key {
    keynumber: number;
    starttime: number;
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
    listenerType: string;
}
export declare function read(id: number): Promise<Object | null>;
export declare function create(listen: ListeningMap): Promise<number>;
export declare function update(id: number, listen: ListeningMap): Promise<number>;
export {};
//# sourceMappingURL=dbaccess.d.ts.map