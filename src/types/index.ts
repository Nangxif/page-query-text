export enum MatchCaseEnum {
  /** 区分大小写 */
  Match = 'Match',
  /** 不区分大小写 */
  DontMatch = 'DontMatch',
}

export type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
};
