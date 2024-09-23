import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { XYZState } from "./xyz";
import { PlayerRole } from "../abstract/types";

export class PlayerState extends Schema {
  //
  @type("string") sessionId: string = "";
  @type("string") userId: string = "";
  @type("string") name: string = "";
  @type("string") role: PlayerRole = "player";
  @type("number") latency: number = 0;
  @type("number") jitter: number = 0;
  @type(XYZState) position: XYZState = new XYZState();
  @type(XYZState) rotation: XYZState = new XYZState();
  @type("string") animation: string = "idle";
  @type("string") vrmUrl: string = "";
  @type("number") scale: number = 1;
  @type("string") text: string = "";
  @type("string") state: string = "";
  @type("string") plugins = "";

  @type("boolean") connected: boolean = false;
}
