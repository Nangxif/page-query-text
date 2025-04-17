import { textSelectionTypeTextMap } from '@/constants/content-scripts';
import { modelTextMap } from '@/constants/pages';
import { SummaryResult } from '@/db/model';
import { ModelType } from '@/types';
import { Collapse, Descriptions, Empty, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
        temperature,
        maxTokens,
        systemPrompt,
        userPrompt,
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
                      AI总结参数
                    </Title>

                    <Descriptions
                      title={null}
                      bordered
                      size="small"
                      items={[
                        {
                          label: '模型',
                          children: modelTextMap[model as ModelType],
                        },
                        {
                          label: '系统提示词',
                          children: systemPrompt || '采用默认系统提示词',
                        },
                        {
                          label: '用户提示词',
                          children: userPrompt || '采用默认用户提示词',
                        },
                        {
                          label: '随机性',
                          children: temperature,
                        },
                        {
                          label: '最大Tokens',
                          children: maxTokens,
                        },
                      ]}
                    />

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
                    <Title
                      level={4}
                      style={{
                        marginTop: '7px',
                      }}
                    >
                      模型输出参数
                    </Title>

                    <Descriptions
                      title={null}
                      bordered
                      size="small"
                      items={[
                        {
                          label: '输入Tokens',
                          children: promptTokens,
                        },
                        {
                          label: '输出Tokens',
                          children: completionTokens,
                        },
                        {
                          label: '总Tokens',
                          children: totalTokens,
                        },
                        {
                          label: '耗时',
                          children: timeUsed,
                        },
                      ]}
                    />
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
    <>
      <Helmet>
        <title>历史总结结果</title>
      </Helmet>
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
    </>
  );
};
export default SummaryResultList;
