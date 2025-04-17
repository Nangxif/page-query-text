import { ResponseCode } from '@/constants/pages';
import { LoadingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Alert, Button, Form, Input, message, Spin } from 'antd';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import styles from '../index.less';
import {
  getPaymentApplyInfoService,
  IPaymentApplyParams,
  paymentApplyService,
  PaymentStatus,
} from '../service';
import PaymentWayRadio from './PaymentWayRadio';

const { Item: FormItem, useForm } = Form;

const PaymentForm = () => {
  const [form] = useForm();
  const [submiting, setSubmiting] = useState(false);
  const [reApply, setReApply] = useState(false);

  const {
    data,
    loading,
    run: getPaymentApplyInfo,
  } = useRequest(async () => {
    try {
      const res = await getPaymentApplyInfoService();
      if (res.code === ResponseCode.SUCCESS) {
        form.setFieldsValue(res.data);
        return res.data;
      } else {
        message.error(res?.message || '获取支付信息失败');
      }
    } catch {
      return null;
    }
  });

  const { paymentStatus } = data || {
    paymentWay: undefined,
    serialNumber: undefined,
    paymentStatus: undefined,
  };

  const handleSubmit = async (values: IPaymentApplyParams) => {
    setSubmiting(true);
    const res = await paymentApplyService(values);
    setSubmiting(false);
    if (res.code === ResponseCode.SUCCESS) {
      message.success('已成功提交审核');
    } else {
      message.error(res?.message || '提交失败');
    }
    getPaymentApplyInfo();
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

      {loading && (
        <Spin spinning size="large" indicator={<LoadingOutlined />}>
          <div style={{ height: '200px' }} />
        </Spin>
      )}

      {!loading &&
        ((paymentStatus !== PaymentStatus.PASS &&
          paymentStatus !== PaymentStatus.NO_PASS) ||
          reApply) && (
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
              <Input
                className={styles.input}
                placeholder="请输入流水号"
                allowClear
              />
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
      {!loading && paymentStatus === PaymentStatus.PASS && (
        <div className={styles['pay-result']}>
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

      {!loading && paymentStatus === PaymentStatus.NO_PASS && !reApply && (
        <div className={styles['pay-result']}>
          <img
            src="data:image/png;base64,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"
            className={styles['pay-icon']}
          />
          <div className={styles['pay-title']}>审核不通过</div>
          <div className={styles['pay-tip']}>
            请重新
            <Button
              type="link"
              onClick={() => setReApply(true)}
              style={{
                padding: 0,
              }}
            >
              提交审核
            </Button>
            ，或
            <Button
              type="link"
              style={{
                padding: 0,
              }}
              onClick={() => {
                copy('575981390@qq.com');
                message.success('已复制管理员邮箱');
              }}
            >
              联系管理员
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
