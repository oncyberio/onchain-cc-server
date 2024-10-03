import { GameSession } from "../cyber";
import { PlayerData } from "../cyber/abstract/types";
import { PlayerState } from "../cyber/schema/PlayerState";
import { RoomState } from "../cyber/schema/RoomState";
import { CoinState, GameState } from "./GameState";
import { loadGame } from "./loadGame";
import { Signature, Wallet, getBytes, solidityPackedKeccak256 } from "ethers";
import crypto from "crypto";
const wallet = new Wallet(process.env.PRIVATE_KEY!);
import { PlayerControls } from "./PlayerControls";

export class DefaultCyberGame extends GameSession<RoomState> {
  //
  maxPlayers = 500;

  // fps
  tickRate = 20;
  patchRate = 20;

  reconnectTimeout = 0;

  state = new GameState();

  engine = null;
  space = null;
  coinModel = null;
  playerModel = null;

  playerController = new PlayerControls();

  async onPreload() {
    console.log("Preloading...");
    this.engine = await loadGame(this.gameId, {
      debugPhysics: true,
      filter: (component: any) => {
        return (
          component.collider?.enabled ||
          component.script?.identifier === "coin" ||
          component.name == "PlayerControls"
        );
      },
    });
    this.space = this.engine.getCurrentSpace();
    this.coinModel = this.space.components.byId("coin");
    const playerModel = this.space.components.byId("playerModel");

    console.log("Coin model", this.coinModel.getDimensions());
    console.log(
      "Player model",
      playerModel.getDimensions(),
      playerModel.behaviors.map((b) => b.name)
    );
    const coins = await this.spawnCoins(10);
    this.playerController.init(this.space, playerModel, coins);
  }

  spawnCoins(nb: number) {
    let promises = [];
    for (let i = 0; i < nb; i++) {
      const coin = new CoinState();
      coin.id = Math.random().toString();
      coin.position.x = Math.random() * 100 - 5;
      coin.position.y = 0.5;
      coin.position.z = Math.random() * 100 - 5;
      this.state.coins.set(coin.id, coin);
      //
      promises.push(this._addCoin(coin.id, coin));
    }

    return Promise.all(promises);
  }

  async _addCoin(id, val) {
    const inst = await this.coinModel.duplicate();
    inst.position.copy(val.position);
    inst.rotation.y = val.rotation.y;
    inst.visible = true;
    inst.userData.coinId = id;
    return inst;
  }

  static onAuth(token: any, request: any): Promise<void> {
    console.log("Authenticating...", token);
    return Promise.resolve();
  }

  async onJoin(player) {
    console.log(player.sessionId, player.userId, "joined!");
    if (this.space == null) {
      console.error("Space not loaded!");
      return;
    }

    this.playerController.addPlayer(player);
  }

  onLeave(player) {
    console.log(player.sessionId, player.userId, "left!");
    this.playerController.removePlayer(player);
  }

  onMessage(message: any, player: PlayerState): void {
    //
    // console.log("Message received from", player.sessionId, message);

    if (message.type === "collect") {
      //
      const coin = this.state.coins.get(message.coinId);

      if (coin.owner) {
        //
        console.error("Coin already collected by", coin.owner);

        return;
      }

      coin.owner = player.sessionId;
      this.sendMint(player);
    } else if (message.type == "declare-address") {
      // UNTRUSTED
      if (!message.address) return;
      player.address = message.address;
    }
  }

  async sendMint(player: PlayerState) {
    if (!player.address) return;

    const word = solidityPackedKeccak256(["string"], [crypto.randomUUID()]);

    const hashedMessage = solidityPackedKeccak256(
      ["address", "bytes32"],
      [player.address, word]
    );

    const { v, r, s } = Signature.from(
      await wallet.signMessage(getBytes(hashedMessage))
    );

    this.send(
      {
        type: "mint-opportunity",
        payload: {
          word,
          signature: { v, r, s },
        },
      },
      player.sessionId
    );
  }
  onPlayerStateMsg(player: PlayerData, extra: any): void {
    //
    const inputs = extra;
    if (!inputs) {
      return;
    }

    this.playerController.validatePosition(player, inputs);
  }

  onRpc(request: any, reply: (data: any) => void): void {
    //
    console.log("RPC received", request);
    if (request.type === "testRpc") {
      reply({ message: "Hello from server!" });
    } else if (request.type === "debugPhysics") {
      this.space.physics.updateDebug();
      const data = this.space.physics.debugLines.toJSON();
      reply(data);
    } else {
      reply({ message: "Invalid request" });
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
