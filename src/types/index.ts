export enum MatchCaseEnum {
  /** 区分大小写 */
  Match = 'Match',
  /** 不区分大小写 */
  DontMatch = 'DontMatch',
}

export enum MatchWholeTextEnum {
  True = 'True',
  False = 'false',
}

export type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
  transformX: number;
  transformY: number;
};

export enum LoadingEnum {
  Loading = 'Loading',
  Loaded = 'Loaded',
}
