import Avatar from '@/components/Avatar';
import { accountTypeTextOptions, ResponseCode } from '@/constants/pages';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Modal, Select } from 'antd';
import Cookies from 'js-cookie';
import styles from '../index.less';
import {
  getUserInfoService,
  logoutService,
  updateUserinfoService,
} from '../service';

type FormData = {
  username: string;
  email: string;
};
const { Item: FormItem, useForm } = Form;
const { confirm } = Modal;
const UpdatePersonData = () => {
  const [form] = useForm();
  const { data: userInfo } = useRequest(async () => {
    const res = await getUserInfoService();
    form.setFieldsValue({
      username: res.data.username || res.data.email,
      email: res.data.email,
      accountType: res.data.accountType,
    });
    return res.data;
  });

  const { run: updateUserInfo, loading } = useRequest(
    async (values: FormData) => {
      const rsp = await updateUserinfoService(values.username);
      if (rsp.code === ResponseCode.SUCCESS) {
        message.success('更新成功');
      } else {
        message.error(rsp.message);
      }
    },
    { manual: true, throttleWait: 500 },
  );
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        个人资料
        <Button
          type="link"
          size="small"
          style={{
            padding: 0,
          }}
          onClick={() => {
            confirm({
              title: '退出登录',
              content: '确定退出登录吗？',
              okText: '确定',
              cancelText: '取消',
              onOk: async () => {
                const res = await logoutService();
                if (res.code === ResponseCode.SUCCESS) {
                  chrome?.storage?.sync?.remove('PAGE_TOOLKIT_TOKEN');
                  Cookies.remove('PAGE_TOOLKIT_TOKEN');
                  message.success('退出登录成功');
                  setTimeout(() => {
                    window.location.href = '/Login.html';
                  }, 1000);
                } else {
                  message.error(res.message);
                }
              },
            });
          }}
        >
          退出登录
        </Button>
      </h1>
      {userInfo?.avatar && (
        <Avatar
          className={styles.avatar}
          avatars={userInfo?.avatar ? [userInfo?.avatar] : []}
          fallbackSplice={2}
          fallback={userInfo?.username || userInfo?.email}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={(values: FormData) => {
          updateUserInfo(values);
        }}
      >
        <FormItem
          label="昵称"
          name="username"
          rules={[{ required: true, message: '请输入昵称' }]}
        >
          <Input
            maxLength={20}
            className={styles.input}
            showCount
            placeholder="请输入昵称"
          />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input className={styles.input} disabled />
        </FormItem>
        <FormItem label="登录方式" name="accountType">
          <Select
            className={styles.input}
            options={accountTypeTextOptions}
            disabled
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

export default UpdatePersonData;
