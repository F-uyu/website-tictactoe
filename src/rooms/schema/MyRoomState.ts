import { Schema, Context, type, MapSchema} from "@colyseus/schema";

export class Player extends Schema {
  @type("string") symbol: string;
}

export class Cell extends Schema {
  @type("string") space: string;
}

export class MyRoomState extends Schema {
  @type({ map: Cell }) board = new MapSchema<Cell>();
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") turn: string = 'O';
  constructor() {
    super();
    // Initialize the board with empty cells
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cellId = `${i}-${j}`;
        this.board.set(cellId, new Cell({space: ""}));
      }
    }
  }
}

