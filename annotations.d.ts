export interface GuidedListener {
    title: string;
    composer: string;
    album: string;
    performer: string;
    url: string;
    sections: section[];
}
export interface section {
    name: string;
    startTime: number;
    endTIme: number;
    text: string;
}
export declare function parseAnnotations(jsonString: string): GuidedListener;
//# sourceMappingURL=annotations.d.ts.map