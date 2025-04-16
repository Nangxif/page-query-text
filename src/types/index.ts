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

export enum NotificationType {
  Success = 'Success',
  Error = 'Error',
  Info = 'Info',
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

export enum ModelType {
  Deepseek_Chat = 'DeepSeek_Deepseek_Chat',
  Gpt_3_5_Turbo = 'Gpt_3_5_Turbo',
  Moonshot_V1_8k = 'Moonshot_V1_8k',
}

export type ResponseError = {
  statusCode: number;
  message: string;
};

export enum TextSelectionType {
  /** 页面文本 */
  PageText = 'PageText',
  /** 选中的文本 */
  SelectionText = 'SelectionText',
}
