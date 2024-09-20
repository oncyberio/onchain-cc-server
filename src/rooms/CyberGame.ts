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
    switch (message.type) {
      case "player-state":
        /**
         * If you're using room.getPlayerStateSync() in the client script,
         *
         * Sync the player state, in case the game uses a state based sync mode
         */
        console.log(
          "player-state",
          player.sessionId,
          message.data[0],
          message.data[2]
        );
        const [
          posX,
          posY,
          posZ,
          rotX,
          rotY,
          rotZ,
          animation,
          scale,
          vrmUrl,
          text,
        ] = message.data;

        player.position.copy({
          x: posX,
          y: posY,
          z: posZ,
        });

        player.rotation.copy({
          x: rotX,
          y: rotY,
          z: rotZ,
        });

        player.animation = animation;
        player.vrmUrl = vrmUrl;
        player.scale = scale;
        player.text = text;
        break;

      case "player-extra-state":
        player.state = JSON.stringify(message?.payload || "");
        break;

      case "broadcast":
        /**
         * Broadcast a message to all players in the room
         */
        const { exclude, ...data } = message;

        this.broadcast(data, exclude || []);

        break;
      case "send":
        /**
         * Send a message to a specific player
         */
        if (
          message.playerId &&
          typeof message.playerId === "string" &&
          this.state.players.has(message.playerId)
        ) {
          this.send(message, message.playerId);
        }

        break;
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
