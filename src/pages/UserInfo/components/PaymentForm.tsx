import { paymentMethodTextOptions } from '@/constants';
import { Button, Form, Input, Select } from 'antd';
import styles from '../index.less';

const { Item: FormItem, useForm } = Form;
/** 更新自己密码 */
const PaymentForm = () => {
  const [form] = useForm();

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>支付</h1>
      <Form layout="vertical" form={form}>
        <FormItem
          label="支付方式"
          name="paymentMethod"
          rules={[{ required: true, message: '请选择支付方式' }]}
        >
          <Select
            options={paymentMethodTextOptions}
            className={styles.input}
            placeholder="请选择支付方式"
          />
        </FormItem>
        <FormItem
          label="流水号"
          name="serialNumber"
          rules={[
            {
              required: true,
              message: '请输入流水号',
            },
          ]}
        >
          <Input className={styles.input} placeholder="请输入流水号" />
        </FormItem>
        <FormItem className="mb-5">
          <Button
            htmlType="submit"
            type="primary"
            className={styles['submit-button']}
          >
            已支付，提交信息
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default PaymentForm;
