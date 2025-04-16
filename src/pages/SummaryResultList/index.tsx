import { textSelectionTypeTextMap } from '@/constants/content-scripts';
import { modelTextMap } from '@/constants/pages';
import { SummaryResult } from '@/db/model';
import { ModelType } from '@/types';
import { Collapse, Empty, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const { Title } = Typography;
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
        originalText,
        textSelectionType,
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
                label: (
                  <>
                    <Tag color="#ccac85" style={{ marginLeft: '8px' }}>
                      {textSelectionTypeTextMap[textSelectionType]}
                    </Tag>
                    {dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </>
                ),
                children: (
                  <div className={styles['summary-result-list-item']}>
                    <Title
                      level={4}
                      style={{
                        marginTop: '7px',
                      }}
                    >
                      原文内容
                    </Title>
                    <div className={styles['summary-result-list-item-content']}>
                      {originalText}
                    </div>
                    <Title
                      level={4}
                      style={{
                        marginTop: '7px',
                      }}
                    >
                      总结
                    </Title>
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
      <div className={styles['summary-result-list-header']}>
        历史总结结果（{list?.length}）
      </div>
      <div className={styles['summary-result-list-page-url']}>
        相关页面地址：{pageUrl}
      </div>
      {items?.length > 0 ? (
        <Timeline items={items} />
      ) : (
        <Empty
          description="暂无总结结果"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};
export default SummaryResultList;
