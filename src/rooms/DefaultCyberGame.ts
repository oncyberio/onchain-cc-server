import { GameSession } from "../cyber";
import { PlayerState } from "../cyber/schema/PlayerState";
import { RoomState } from "../cyber/schema/RoomState";

export class DefaultCyberGame extends GameSession<RoomState> {
  //
  maxPlayers = 4;

  // fps
  tickRate = 20;
  patchRate = 20;

  reconnectTimeout = 0;

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

  onMessage(message: any, player: PlayerState): void {}

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
