export enum PageQueryTextDataBaseTableName {
  /** 总结结果列表 */
  SUMMARY_RESULT_LIST = 'summary_result_list',
}

export const PageQueryTextDataBaseTableNamesAndKeyPaths = {
  [PageQueryTextDataBaseTableName.SUMMARY_RESULT_LIST]: 'id,pageUrl',
} as Record<string, string>;
