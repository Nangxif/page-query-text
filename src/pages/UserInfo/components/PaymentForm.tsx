import { paymentWayTextOptions } from '@/constants';
import { Alert, Button, Form, Input, Radio } from 'antd';
import styles from '../index.less';
import { IPayApplyParams, payApplyService } from '../service';

const { Item: FormItem, useForm } = Form;
const { Group: RadioGroup } = Radio;

/** 更新自己密码 */
const PaymentForm = () => {
  const [form] = useForm();

  const handleSubmit = async (values: IPayApplyParams) => {
    payApplyService(values);
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>支付</h1>
      <Alert
        message="支付Page Toolkit后可以使用所有相关的工具"
        type="info"
        showIcon
        style={{
          marginBottom: '24px',
        }}
      />
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <FormItem
          label="支付方式"
          name="paymentWay"
          rules={[{ required: true, message: '请选择支付方式' }]}
        >
          <RadioGroup options={paymentWayTextOptions} />
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
        <Button
          htmlType="submit"
          type="primary"
          className={styles['submit-button']}
        >
          已支付，提交信息
        </Button>
      </Form>
    </div>
  );
};

export default PaymentForm;
