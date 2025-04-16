import { Dexie, Table } from 'dexie';
import { SummaryResult } from './model';
import {
  PageQueryTextDataBaseTableName,
  PageQueryTextDataBaseTableNamesAndKeyPaths,
} from './rules';

class PageQueryTextDataBase extends Dexie {
  constructor() {
    super('page-query-text-database');
    this.version(1).stores(PageQueryTextDataBaseTableNamesAndKeyPaths);
  }
  private getTable<T = any>(tableName: PageQueryTextDataBaseTableName) {
    return (this as any)[tableName] as Table<T>;
  }
  /** 获取总结结果列表 */
  getSummaryResultList(pageUrl: string) {
    return new Promise((resolve) => {
      this.getTable(PageQueryTextDataBaseTableName.SUMMARY_RESULT_LIST)
        .where('pageUrl')
        .equals(pageUrl)
        .sortBy('createdAt')
        .then((results) => {
          resolve(results.reverse());
        });
    });
  }

  /** 添加总结结果 */
  addSummaryResult(summaryResult: SummaryResult) {
    return this.getTable(
      PageQueryTextDataBaseTableName.SUMMARY_RESULT_LIST,
    ).add(summaryResult);
  }
}

// 连接数据库
export const pageQueryTextDataBase = new PageQueryTextDataBase();
