import { ResponseCode } from '@/constants/pages';
import { LoadingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Alert, Button, Form, Input, message, Spin } from 'antd';
import { useState } from 'react';
import styles from '../index.less';
import {
  getPayApplyInfoService,
  IPayApplyParams,
  payApplyService,
  PaymentStatus,
} from '../service';
import PaymentWayRadio from './PaymentWayRadio';

const { Item: FormItem, useForm } = Form;

/** 更新自己密码 */
const PaymentForm = () => {
  const [form] = useForm();
  const [submiting, setSubmiting] = useState(false);

  const {
    data = {
      paymentWay: undefined,
      serialNumber: undefined,
      paymentStatus: undefined,
    },
  } = useRequest(async () => {
    const res = await getPayApplyInfoService();
    if (res.code === ResponseCode.SUCCESS) {
      form.setFieldsValue(res.data);
      return res.data;
    }
  });

  const { paymentStatus } = data;

  const handleSubmit = async (values: IPayApplyParams) => {
    setSubmiting(true);
    const res = await payApplyService(values);
    setSubmiting(false);
    if (res.code === ResponseCode.SUCCESS) {
      message.success('已成功提交审核');
    } else {
      message.error(res?.message || '提交失败');
    }
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

      {!paymentStatus && (
        <Spin spinning size="large" indicator={<LoadingOutlined />}>
          <div style={{ height: '200px' }} />
        </Spin>
      )}

      {paymentStatus && paymentStatus !== PaymentStatus.REVIEWED && (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <FormItem
            label="支付方式"
            name="paymentWay"
            rules={[{ required: true, message: '请选择支付方式' }]}
          >
            <PaymentWayRadio />
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
          {paymentStatus === PaymentStatus.PAID_PENDING_REVIEW && (
            <Alert
              type="info"
              showIcon
              message="如填错信息，可重新发起审核流程"
              style={{
                marginBottom: '24px',
              }}
            />
          )}
          <Button
            htmlType="submit"
            type="primary"
            className={styles['submit-button']}
            danger={paymentStatus === PaymentStatus.PAID_PENDING_REVIEW}
            loading={submiting}
          >
            {paymentStatus === PaymentStatus.PAID_PENDING_REVIEW
              ? '有订单正在审核中，确认重新提交'
              : '已支付，提交信息'}
          </Button>
        </Form>
      )}
      {paymentStatus && paymentStatus === PaymentStatus.REVIEWED && (
        <div className={styles['pay-success']}>
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAb1BMVEUAAABhwo9gw49hwo9iwo9hwo9hwo9hwo9gx49gv49hwo9hwo9hwY9hwo9hwY9hwpBiwo9gw49iwpBiwo9kw49jw45hwo/////r9/F1yp31+/iw4ceAzqVrxpa65c7N7Nya2bjh9Oqm3MCm3cDE6NUNMR4PAAAAFnRSTlMA3xDvn4BgUCAgz7+QcO+/j0Cvr0BvuZ3hWgAAAllJREFUaN7tmV1yozAQhBESYP5sY3sHAyYm2dz/jMvGpOYBwWgYVSoPfAfoxtNqhKxgZ2fHmTApTa4UjOgsN9Et9Cp+VjBDmcSPye2qYQmTiB8+0rCKig9CeRIVbdaPFTih4k3yhxycuW6Y0x8NDHTMnf4ZmJx548mATXZg6CvYgDoI9GUOcn10kOvLHTIQkNHvP2J9ildrDEJKIgANQvR6DFcQkxMDkrP2WlLgAbW8kiLwQuSxYn1vyzn0l8Dz3hA/QZbAW13bHLRdPwEuXT3SPmBGZTUwwORv/WLucLXuksDkMek/rTHLJ9S0L/17D3MS+YSa+6TfgIVCvIb6Sb9t7G0WR/DEgK3MQ7gxC/DiAxAihIhdgJGOse+YDQV4g0XMzCC3Z8krAHJy+5gY2gddAMdlpO2P2g5EAZwNbPpfjzpwCoCQBvioHaMALIOhnuiIArANMGJ0oApAG6ilEHDB0wVANG2AMYx8uhUAydyKhg7vPVEAsmgGCIeGKAD1qijBTvNeT7pYAAci9x2z/3bAAjhQcTacT1THAhCEjC0T24UFoFDBnILaYLAANIb72dKRBaA/W0JNOGABWBEgF1jjAwvAmxBSwSoD6vMmhGjwhPJ/gqKPgRizHJX+8CEQCZWfBH7+II7kIOYSrJGKcz6mwSqlfEAEBYgoAopQ9pdaQJMqWcX4DnJ9uQPqixzk+uiQbciX0Jeu1iIMeMSa1d8yYJNewJlT+hsvif4TOVgcI8mFYBorWl5IYpbVL5Wny1JjuywtEq83slVkTtnxS1mdTDmK7+zsuPIPLXqu8jHlQN4AAAAASUVORK5CYII="
            className={styles['pay-icon']}
          />
          <div className={styles['pay-title']}>支付成功</div>
          <div className={styles['pay-tip']}>
            现在您可以使用Page Toolkit的全部工具了
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
