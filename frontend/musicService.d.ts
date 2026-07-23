export declare function initMusicKit(developerToken: string, updateButton: () => void, updateTrack: () => void, type: string): Promise<void>;
export declare function authorize(): Promise<void>;
export declare function setQueue(songId: string): Promise<void>;
export declare function togglePlay(): Promise<void>;
export declare function checkReady(): boolean;
export declare function getCurrentTime(): number;
export declare function getDuration(): number;
export declare function seekToTime(time: number): void;
export declare function getInstance(): any;
export declare function getPlaybackState(): any;
export declare function getQueue(): any;
export declare function isAuthorized(): boolean;
export declare function getAttributes(): MusicKit.MediaItem;
export declare function getTrack(): Promise<MusicKit.MediaItem>;
//# sourceMappingURL=musicService.d.ts.map