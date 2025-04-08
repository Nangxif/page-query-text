import { ResponseCode } from '@/constants';
import { GithubOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useRef, useState } from 'react';
import styles from './index.less';
import { getEmailCodeService, loginService } from './service';

const { Item: FormItem, useForm } = Form;
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = useForm();
  const [isGetCodeLoading, setIsGetCodeLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const emailCodeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleGetCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.error('请输入邮箱地址');
      return;
    }
    setIsGetCodeLoading(true);
    const res = await getEmailCodeService(email);
    if (res.code === ResponseCode.SUCCESS) {
      message.success('验证码发送成功');
      emailCodeTimer.current = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
        if (remainingTime <= 0) {
          clearInterval(emailCodeTimer.current as NodeJS.Timeout);
          setRemainingTime(60);
        }
      }, 1000);
    }
    setIsGetCodeLoading(false);
  };

  const handleEmailSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      const res = await loginService(values.email, values.code);
      if (res.code === ResponseCode.SUCCESS) {
        window.location.href = '/UserInfo.html';
      } else {
        message.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    window.location.href = `http://localhost:3001/api/auth/github`;
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['ip-logo']} />
        <h3>欢迎登录Page Toolkit</h3>

        <Form
          onFinish={handleEmailSubmit}
          className={styles['login-form']}
          layout="vertical"
          form={form}
        >
          <FormItem
            label="邮箱地址"
            name="email"
            rules={[{ required: true, message: '请输入邮箱地址' }]}
          >
            <Input type="email" placeholder="请输入邮箱地址" allowClear />
          </FormItem>

          <FormItem
            label="验证码"
            name="code"
            rules={[{ required: true, message: '请输入6位验证码' }]}
          >
            <Input
              placeholder="请输入6位验证码"
              allowClear
              addonAfter={
                <Button
                  size="small"
                  type="link"
                  onClick={handleGetCode}
                  loading={isGetCodeLoading}
                  disabled={remainingTime > 0 && remainingTime < 60}
                >
                  {remainingTime > 0 && remainingTime < 60
                    ? `获取验证码(${remainingTime}s)`
                    : '获取验证码'}
                </Button>
              }
            />
          </FormItem>

          <Button
            htmlType="submit"
            disabled={isLoading}
            type="primary"
            style={{
              width: '100%',
            }}
          >
            登录
          </Button>
        </Form>

        <Button
          className={styles['github-btn']}
          onClick={handleGithubLogin}
          icon={<GithubOutlined />}
        >
          使用 GitHub 登录
        </Button>
      </div>
    </div>
  );
};

export default Login;
