export interface GuidedListener {
    pk: number;
    title: string;
    composer: string;
    album: string;
    performer: string;
    trackid: number;
    uri: string;
    duration: number;
    sections: section[];
}
export interface section {
    annotationid: number;
    sectionnumber: number;
    sectionname: string;
    starttime: number;
    endtime: number;
    notes?: string;
}
export declare function createAnnotations(request: GuidedListener): void;
export declare function getAnnotations(): GuidedListener;
export declare function getNotes(): string[];
export declare function getEnds(): number[];
//# sourceMappingURL=annotations.d.ts.map