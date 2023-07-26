import { Room, Client } from "@colyseus/core";
import { MyRoomState} from "./schema/MyRoomState";
import {Cell} from "./schema/MyRoomState"
import {Player} from "./schema/MyRoomState"

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    /*for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++){
        const cellId = `${i}-${j}`
        this.state.board.set(cellId, new Cell({space: ""}))
        
      }
    }*/
    this.onMessage("move", (client, message) => {
      this.makeMove(client.sessionId, message.row, message.col)
    });
  }

  makeMove(sessionId: string, row: number, col: number){
    console.log("ran")
    const currentPlayer = this.state.players.get(sessionId)
    if (currentPlayer && currentPlayer.symbol === this.state.turn && this.isCellEmpty(row, col)){
      const cellId = `${row}-${col}`
      this.state.board.get(cellId).space = currentPlayer.symbol
      this.state.turn = this.state.turn === "X" ? "O" : "X"
      this.broadcast("updateBoard", this.state.board.toJSON())
    }
  }

  isCellEmpty(row: number, col: number){
    const cellId = `${row}-${col}`
    return this.state.board.get(cellId).space === ""
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player()
    player.symbol = this.state.players.size === 0 ? "X" : "O"

    this.state.players.set(client.sessionId, player)
    console.log(this.state.turn)
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
