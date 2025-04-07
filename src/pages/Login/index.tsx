import { GithubOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import styles from './index.less';

const { Item: FormItem } = Form;
const Login = () => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isCodeSent) {
        // 发送验证码请求
        setIsCodeSent(true);
      } else {
        // 验证验证码请求
        // 登录成功后的处理，比如重定向或状态更新
        window.location.href = '/dashboard';
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    // 重定向到GitHub授权页面
    window.location.href =
      'https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID';
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
        >
          <FormItem label="邮箱地址" name="email">
            <Input type="email" placeholder="请输入邮箱地址" allowClear />
          </FormItem>

          <FormItem label="验证码" name="code">
            <Input placeholder="请输入6位验证码" allowClear />
          </FormItem>

          <Button
            htmlType="submit"
            disabled={isLoading}
            type="primary"
            style={{
              width: '100%',
            }}
          >
            {isLoading ? '处理中...' : isCodeSent ? '登录' : '获取验证码'}
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
