import { RoomState } from "../cyber/schema/RoomState";
import { GameSession } from "../cyber/abstract/GameSession";
import { createGameRoom } from "../colyseus/createRoom";
import { Player } from "../cyber/schema/Player";

export class CyberGame extends GameSession<RoomState> {
  //
  maxPlayers = 4;

  state = new RoomState();

  async onPreload() {
    console.log("Preloading...");
  }

  static onAuth(token: any, request: any): Promise<void> {
    console.log("Authenticating...", token);
    return Promise.resolve();
  }

  onJoin(player) {
    console.log(player.sessionId, player.userId, "joined!");
  }

  onLeave(player) {
    console.log(player.sessionId, player.userId, "left!");
  }

  onMessage(message: any, player: Player): void {
    //
    if (message.x != null) {
      player.position.x = message.x;
      player.position.y = message.y;
      player.state = message.state;
    }
  }

  // onUpdate(dt: number): void {
  //   console.log("updating...");
  //   this.state.players.forEach((player) => {
  //     //
  //     player.position.x += 0.01;
  //   });
  // }

  onDispose() {
    console.log("disposing...");
  }
}

export const CyberGameRoom = createGameRoom(CyberGame);
