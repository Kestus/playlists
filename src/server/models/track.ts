import { prisma } from '../db'

// export class Track {
//     name: string;
//     author: string;
//     lenghtSecondsL: number;

//     constructor (name: string, author: string, lengthSeconds: number){
//         this.name = name;
//         this.author = author;
//         this.lenghtSecondsL = lengthSeconds;
//     }

//     getName(): string { return this.name; }

// }

export function TestTrack() {
    const track = prisma.track.findFirst();
    return track
}
