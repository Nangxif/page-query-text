import { modelTextMap } from '@/constants/pages';
import { SummaryResult } from '@/db/model';
import { ModelType } from '@/types';
import { Collapse, Timeline } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const SummaryResultList = () => {
  const [list, setList] = useState<SummaryResult[]>([]);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    chrome?.runtime?.onMessage?.addListener((request) => {
      if (request.action === 'sendDataToSummaryResultListSidePanel') {
        setList(request.data.summaryResultList);
        setPageUrl(request.data.pageUrl);
      }
    });
  }, []);

  const items = useMemo(() => {
    return list.map((item) => {
      const {
        id,
        summary,
        promptTokens,
        completionTokens,
        totalTokens,
        createdAt,
        timeUsed,
        model,
      } = item;
      return {
        children: (
          <Collapse
            size="small"
            defaultActiveKey={[id]}
            items={[
              {
                key: id,
                label: dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss'),
                children: (
                  <div className={styles['summary-result-list-item']}>
                    <div className={styles['summary-result-list-item-content']}>
                      {summary}
                    </div>
                    <div className={styles['summary-result-list-item-model']}>
                      模型：{modelTextMap[model as ModelType]}
                    </div>
                    <div className={styles['summary-result-list-item-info']}>
                      <span>输入Tokens: {promptTokens}</span>
                      <span>输出Tokens: {completionTokens}</span>
                      <span>总Tokens: {totalTokens}</span>
                      <span>耗时: {timeUsed}ms</span>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        ),
      };
    });
  }, [list]);
  return (
    <div className={styles['summary-result-list']}>
      <div className={styles['summary-result-list-header']}>历史总结结果</div>
      <div className={styles['summary-result-list-page-url']}>
        相关页面地址：{pageUrl}
      </div>
      <Timeline items={items} />
    </div>
  );
};
export default SummaryResultList;
