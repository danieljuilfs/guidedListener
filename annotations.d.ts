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
    endTime: number;
    text?: string;
}
export declare function createAnnotations(): GuidedListener;
//# sourceMappingURL=annotations.d.ts.map