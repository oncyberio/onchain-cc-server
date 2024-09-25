import { PlayerEntity } from "./PlayerState";
import { GameTimer } from "./GameTimer";
import { Entity, P } from "./types";

class RoomSettings extends Entity {
  reconnectTimeout = P.Number(0);
  patchRate = P.Number(20);
  tickRate = P.Number(20);
}

export class RoomState extends Entity {
  //
  snapshotId = P.String("");
  timestamp = P.Number(0);
  players = P.Map(PlayerEntity);
  timer = P.Object(GameTimer);
  settings = P.Object(RoomSettings);

  addPlayer(data: any) {
    const player = new PlayerEntity();
    player.sessionId = data.sessionId;
    player.userId = data.userId ?? "anon";
    player.name = data.name ?? "Anonymous";
    player.role = data.role ?? "player";
    player.position.assign(data.position ?? { x: 0, y: 0, z: 0 });
    player.rotation.assign(data.rotation ?? { x: 0, y: 0, z: 0 });
    player.animation = data.animation ?? "idle";
    player.text = data.text ?? "";

    player.connected = true;

    this.players.set(data.sessionId, player);
    // console.log("added player", player.toJSON());
  }

  removePlayer(id: string) {
    this.players.delete(id);
  }
}
