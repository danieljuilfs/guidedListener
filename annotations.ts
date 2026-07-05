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

export function parseAnnotations(jsonString: string): GuidedListener {
    const annotations: GuidedListener = JSON.parse(jsonString); 
    return annotations; 
 }