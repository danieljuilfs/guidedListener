export interface GuidedListener {
    title: string;
    composer: string;
    album: string;
    performer: string;
    url: string;
    duration: number;
    sections: section[];
}
export interface section {
    name: string;
    startTime: number;
    endTime: number;
    text?: string;
}
export declare function createAnnotations(): void;
export declare function getAnnotations(): GuidedListener;
export declare function getNotes(): string[];
export declare function getEnds(): number[];
//# sourceMappingURL=annotations.d.ts.map