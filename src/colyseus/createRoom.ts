import type { IncomingMessage } from "http";
import { Room, Client, logger } from "@colyseus/core";
import { CYBER_MSG } from "../cyber/abstract/types";

const defaults = {
  PATCH_RATE: 1000 / 20,
  TICK_RATE: 1000 / 30,
};

export function createGameRoom(RoomHandler) {
  //
  return class GameServer extends Room {
    //
    private _room = new RoomHandler(this);

    private _gameId: string;

    private _logger = logger;

    patchRate = this._room.patchRate ?? defaults.PATCH_RATE;

    maxClients = this._room.maxPlayers ?? 500;

    // tickRate = this._room.tickRate ?? defaults.TICK_RATE;

    constructor(...args) {
      super(...args);

      // this.setSimulationInterval(() => {
      //     this._room._CALLBACKS_.tick();
      // }, this.tickRate);

      this.setState(this._room.state);

      this.onMessage(CYBER_MSG, this._onCyberMsg);
    }

    get gameId() {
      return this._gameId;
    }

    get nbConnected() {
      return this.clients.length;
    }

    getClient(sessionId: string) {
      const client = this.clients.getById(sessionId);
      if (!client) {
        console.error(`Client ${sessionId} not found`);
      }
      return client;
    }

    sendMsg(msg: any, sessionId: string) {
      this.getClient(sessionId)?.send(CYBER_MSG, msg);
    }

    broadcastMsg(msg: any, opts: { except?: string[] } = {}) {
      let except = opts?.except
        ?.map((id) => this.getClient(id))
        .filter(Boolean);
      this.broadcast(CYBER_MSG, msg, { except });
    }

    disconnectPlayer(sessionId: string, reason = 4000) {
      const client = this.clients.getById(sessionId);

      if (!client) {
        console.error(`Connection ${sessionId} not found`);

        return;
      }

      client.leave(reason);
    }

    async onCreate(opts: any) {
      try {
        this._gameId = opts.gameId ?? "anon-game";

        this._logger.info("Creating Room for game", this._gameId);

        await this._room._CALLBACKS_.start();
      } catch (err) {
        this._logger.error(err);
      }
    }

    static async onAuth(token: string, request: IncomingMessage) {
      try {
        await RoomHandler.onAuth(token, request);

        return true;
      } catch (err) {
        //
        console.error(err);

        return false;
      }
    }

    onBeforePatch(state: any) {
      //
      this._room._CALLBACKS_.beforePatch(state);
    }

    async onJoin(client: Client, options: any, auth: any) {
      // A websocket just connected!

      this._logger.info(
        "Connected:",
        `id: ${client.sessionId}`,
        `this.room: ${this._gameId}/${this.roomId}`
      );

      await this._room._CALLBACKS_.join({
        ...options,
        auth,
        id: client.sessionId,
      });
    }

    async onLeave(client: Client, consented: boolean) {
      //
      try {
        //
        //
        this._logger.info("Disconnected: id", client.sessionId, consented);

        if (consented) {
          //
          throw new Error("Consented leave");
        }

        const reconnectTimeout = this._room._CALLBACKS_.disconnect(
          client.sessionId
        );

        if (!reconnectTimeout) {
          console.error("No timeout, leaving");
          throw new Error("No timeout");
        }

        this._logger.info(
          "Client has disconnected, waiting for reconnection in ",
          reconnectTimeout / 1000,
          "seconds",
          client.sessionId
        );

        await this.allowReconnection(client, reconnectTimeout / 1000);

        this._logger.info("Client has reconnected", client.sessionId);

        this._room._CALLBACKS_.reconnect(client.sessionId);
      } catch (err) {
        //
        this._room._CALLBACKS_.leave(client.sessionId);

        if (this.clients.length === 0) {
          this._logger.info("No more connections, closing room");

          // this._room._CALLBACKS_.shutdown();
        }
      }
    }

    onDispose(): void | Promise<any> {
      //
      this._logger.info("Room disposed");

      this._room._CALLBACKS_.shutdown();
    }

    private _onCyberMsg = (client: Client, message: any) => {
      //
      this._room._CALLBACKS_.message(message, client.sessionId);
    };
  };
}
