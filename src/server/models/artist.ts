import { type Artists } from "@prisma/client";

export class Artist {
  data: Artists

  constructor(dbEntry: Artists) {
    this.data = dbEntry;
  }

  getName() { return this.data.name }

  //TODO
}

