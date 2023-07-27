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
    const currentPlayer = this.state.players.get(sessionId)
    if (currentPlayer && currentPlayer.symbol === this.state.turn && this.isCellEmpty(row, col)){
      const cellId = `${row}-${col}`
      this.state.board.get(cellId).space = currentPlayer.symbol
      this.state.turn = this.state.turn === "X" ? "O" : "X"
    }
    const winner = this.checkWinner()
    const tie = this.checkTie()
    if (winner) {
      console.log("winner", winner)
      this.resetBoard()
    }
    if (tie) {
      console.log("tie")
      this.resetBoard()
    }
    this.broadcast("updateBoard", this.state.board.toJSON())
  }

  isCellEmpty(row: number, col: number){
    const cellId = `${row}-${col}`
    return this.state.board.get(cellId).space === ""
  }

  checkWinner(): string | null {
    const winningCombos = [
      ["0-0", "0-1", "0-2"], // top row
      ["1-0", "1-1", "1-2"], // middle row
      ["2-0", "2-1", "2-2"], // bottom row
      ["0-0", "1-0", "2-0"], // left column
      ["0-1", "1-1", "2-1"], // middle column
      ["0-2", "1-2", "2-2"], // right column
      ["0-0", "1-1", "2-2"], // top left to bottom right
      ["0-2", "1-1", "2-0"] // top right to bottom left
    ];
    for (const combination of winningCombos) {
      const [cell1, cell2, cell3] = combination;
      const value1 = this.state.board.get(cell1)?.space;
      const value2 = this.state.board.get(cell2)?.space;
      const value3 = this.state.board.get(cell3)?.space;
  
      if (value1 && value1 === value2 && value2 === value3) {
        return value1; // Return the winning symbol (X or O)
      }
    }
  
    return null; // No winner found
  }

  checkTie(): boolean {
    const board = this.state.board;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cellId = `${i}-${j}`;
        if (board.get(cellId)?.space === "") {
          // Found an empty cell, the game is not a tie yet
          return false;
        }
      }
    }
  
    // If no empty cells were found, it's a tie
    return true;
  }

  resetBoard() {
    const board = this.state.board;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cellId = `${i}-${j}`;
        board.get(cellId).space = "";
      }
    }
  
    // Reset the current turn to "X" (assuming "X" starts first)
    this.state.turn = "X";
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
