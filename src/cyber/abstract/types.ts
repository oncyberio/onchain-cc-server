import type { MapSchema, Schema } from "@colyseus/schema";

export const PLAYER_ROLES = {
  host: "host",
  player: "player",
} as const;

export type PlayerRole = keyof typeof PLAYER_ROLES;

export interface PlayerData {
  main?: boolean;
  sessionId: string;
  userId?: string;
  name: string;
  vrmUrl?: string;
  avatarUrl?: string;
  isAnonymous?: boolean;
  role?: PlayerRole;
  latency: number;
  plugins: string;
  jitter: number;
  // Server authoritative state
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  animation: string;
}

export const CYBER_MSG = "@cyber/msg";

export const GameActions = {
  START: 1,
  STOP: 2,
} as const;

export type GameAction = (typeof GameActions)[keyof typeof GameActions];

export enum Messages {
  // server -> client
  ROOM_GAME_ACTION = 1101,
  ROOM_MESSAGE = 1102,

  // client -> server
  GAME_MESSAGE = 100,
  GAME_REQUEST = 101,
}

export interface GameActionMessage {
  type: Messages.ROOM_GAME_ACTION;
  action: GameAction;
  data?: any;
}

export interface RoomMessage<RM> {
  type: Messages.ROOM_MESSAGE;
  data: RM;
}

export type ServerMessage<RM> = GameActionMessage | RoomMessage<RM>;

export interface PlayerMessage<M> {
  type: Messages.GAME_MESSAGE;
  data: M;
}

export interface GameRequest {
  type: Messages.GAME_REQUEST;
  action: GameAction;
  data?: any;
}

export type ClientMessage<M> = PlayerMessage<M> | GameRequest;

export interface BaseRoomState extends Schema {
  snapshotId: string;
  timestamp: number;
  players: MapSchema<PlayerData>;

  addPlayer(player: PlayerData): void;
  removePlayer(sessionId: string): void;
}
