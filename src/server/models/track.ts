import { type Tracks } from "@prisma/client";


export class Track {
  data: Tracks;

  constructor(dbEntry: Tracks) {
    this.data = dbEntry;
  }

  getName(): string {
    return this.data.name;
  }


}

