import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";
import { GameTimer } from "./GameTimer";

class RoomSettings extends Schema {
  @type("number") reconnectTimeout = 0;
  @type("number") patchRate = 20;
  @type("number") tickRate = 20;
}

export class RoomState extends Schema {
  //
  @type("string") snapshotId: string = null;
  @type("number") timestamp: number = 0;
  @type({ map: Player }) players = new MapSchema<Player>();

  @type(GameTimer) timer: GameTimer = new GameTimer();

  @type(RoomSettings) settings = new RoomSettings();

  addPlayer(data: any) {
    const player = new Player();
    player.sessionId = data.sessionId;
    player.userId = data.userId ?? "anon";
    player.name = data.name ?? "Anonymous";
    player.role = data.role;
    player.latency = data.latency;
    player.position.copy(data.position);
    player.rotation.copy(data.rotation);
    player.animation = data.animation;
    player.text = data.text ?? "";
    player.state = data.state ?? "";

    player.connected = true;

    this.players.set(data.sessionId, player);
    // console.log("added player", player.toJSON());
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }
}
