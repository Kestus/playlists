import { Artists } from "@prisma/client";

export class Artist {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export function artistDataToClass(data: Artists): Artist {
  return new Artist(data.id, data.name);
}
