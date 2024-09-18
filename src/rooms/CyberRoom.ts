import { Room, Client } from "@colyseus/core";
import { GameRoom } from "@oogg/game-server-colyseus";
import { RoomState } from "./schema/RoomState";

export class CyberRoom extends GameRoom {
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

  onDispose() {
    console.log("disposing...");
  }
}
