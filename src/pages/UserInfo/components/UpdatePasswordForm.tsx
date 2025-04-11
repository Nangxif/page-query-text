import { ReactComponent as PasswordHiddenIcon } from '@/assets/images/password-hidden-icon.svg';
import { ReactComponent as PasswordShowIcon } from '@/assets/images/password-show-icon.svg';
import { ResponseCode } from '@/constants/pages';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message } from 'antd';
import styles from '../index.less';
import { updatePasswordService } from '../service';

const { Item: FormItem, useForm } = Form;
/** 更新自己密码 */
const UpdatePasswordForm = () => {
  const [form] = useForm();

  const { run: onsubmit, loading } = useRequest(
    async () => {
      const values = await form.validateFields();
      const res = await updatePasswordService(values?.password);
      if (res.code !== ResponseCode.SUCCESS) {
        message.error(res.message || '更新密码失败');
        return;
      }
      message.success('更新密码成功');
    },
    { manual: true, throttleWait: 500 },
  );

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>密码设置</h1>
      <Form layout="vertical" form={form} onFinish={onsubmit}>
        <FormItem
          label="新密码"
          name="password"
          rules={[
            { required: true },
            {
              min: 8,
              message: '密码长度至少为8个字符',
            },
          ]}
        >
          <Input.Password
            className={styles.input}
            maxLength={30}
            autoComplete="new-password"
            placeholder="请输入新密码"
            iconRender={(value) => {
              if (value) {
                return <PasswordShowIcon />;
              }
              return <PasswordHiddenIcon />;
            }}
          />
        </FormItem>
        <FormItem
          label="确认新密码"
          name="againPassword"
          rules={[
            {
              required: true,
              message: '请再次输入相同的密码',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            className={styles.input}
            maxLength={30}
            //@ts-ignore
            autoComplete="new-password"
            placeholder="请再次输入新密码"
            iconRender={(value) => {
              if (value) {
                return <PasswordShowIcon />;
              }
              return <PasswordHiddenIcon />;
            }}
          />
        </FormItem>
        <FormItem className="mb-5">
          <Button
            htmlType="submit"
            type="primary"
            loading={loading}
            className={styles['submit-button']}
          >
            保存
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default UpdatePasswordForm;
