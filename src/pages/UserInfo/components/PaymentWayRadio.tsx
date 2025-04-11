import { paymentWayTextOptions } from '@/constants/pages';
import { Radio } from 'antd';
import styles from '../index.less';
import { PaymentWay } from '../service';

type PaymentWayRadioProps = {
  value?: PaymentWay;
  onChange?: (value?: PaymentWay) => void;
};
const PaymentWayRadio = (props: PaymentWayRadioProps) => {
  const { value, onChange } = props;
  return (
    <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)}>
      <div className={styles['radio-container']}>
        {paymentWayTextOptions.map((way, index) => {
          const { label, value: val, img } = way;
          return (
            <div
              className={`${styles['radio-item']} ${
                value === val ? styles.active : ''
              }`}
              key={index}
            >
              <Radio value={val}>{label}</Radio>
              <div className={styles.img}>
                <img src={img} />
              </div>
            </div>
          );
        })}
      </div>
    </Radio.Group>
  );
};
export default PaymentWayRadio;
