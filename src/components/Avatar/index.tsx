import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import classNames from 'classnames';
import { memo } from 'react';
import styles from './index.less';

type AvatarProps = {
  avatars?: string[];
  fallback?: string;
  fallbackSplice?: number;
  className?: string;
  loading?: boolean;
  indicatorSize?: 'default' | 'small' | 'large';
};
const linesMap = {
  1: [[0]],
  2: [[0, 1]],
  3: [[0], [1, 2]],
  4: [
    [0, 1],
    [2, 3],
  ],
  5: [
    [0, 1],
    [2, 3, 4],
  ],
  6: [
    [0, 1, 2],
    [3, 4, 5],
  ],
  7: [[0], [1, 2, 3], [4, 5, 6]],
  8: [
    [0, 1],
    [2, 3, 4],
    [5, 6, 7],
  ],
  9: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ],
} as Record<number, number[][]>;

function generateIndexFromUsername(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Ensure the result is always non-negative
  const positiveHash = Math.abs(hash);

  // Map the hash to a number between 0 and 18
  return positiveHash % 18;
}

const Avatar = (props: AvatarProps) => {
  const {
    avatars,
    fallback,
    fallbackSplice,
    className,
    loading,
    indicatorSize,
    ...rest
  } = props;
  const length = avatars?.length || 0;

  const bgColor = [
    '#B0B6DA',
    '#8891C1',
    '#A1A5B7',
    '#DEC1B0',
    '#CDAD99',
    '#DB8A71',
    '#8FBF96',
    '#6DAB91',
    '#849573',
    '#BCBBB3',
    '#A8A486',
    '#868686',
    '#D1D5D8',
    '#AFC0D0',
    '#7594B1',
    '#DDCCB0',
    '#C6AF88',
    '#AD9670',
  ][generateIndexFromUsername(fallback || '')];
  if (length > 0) {
    return (
      <Spin
        spinning={!!loading}
        indicator={<LoadingOutlined />}
        size={indicatorSize}
        wrapperClassName={classNames(styles.spin, className)}
      >
        <div className={styles.avatar} {...rest}>
          {linesMap[length]?.map((line, index) => {
            return (
              <div
                className={styles.line}
                style={{
                  width: '100%',
                  height: `${100 / linesMap[length]?.length}%`,
                }}
                key={index}
              >
                {line?.map((item) => {
                  return (
                    <div
                      className={styles.item}
                      key={item}
                      style={{
                        alignItems:
                          linesMap[length]?.length === 1 ? 'center' : '',
                      }}
                    >
                      <img src={avatars?.[item]} loading="lazy" />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Spin>
    );
  }
  return (
    <Spin
      spinning={!!loading}
      indicator={<LoadingOutlined />}
      size={indicatorSize}
      wrapperClassName={classNames(styles.spin, className)}
    >
      <div
        className={classNames(styles.avatar, className)}
        style={{
          color: 'white',
          backgroundColor: bgColor,
        }}
        {...rest}
      >
        {fallback?.slice(0, fallbackSplice || 1)}
      </div>
    </Spin>
  );
};
export default memo(Avatar);
