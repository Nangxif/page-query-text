import Avatar from '@/components/Avatar';
import { accountTypeTextOptions, ResponseCode } from '@/constants';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Select } from 'antd';
import styles from '../index.less';
import { getUserInfoService } from '../service';

type FormData = {
  username: string;
  email: string;
};
const { Item: FormItem, useForm } = Form;
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
      const rsp = await updateUserInfoService({
        nickName: values.nickName,
        email: values.email,
        enableEmail: initialState?.userInfo?.enableEmail,
        enablePhone: initialState?.userInfo?.enablePhone,
        phone: userInfo?.phone,
      });

      if (rsp.code === ResponseCode.Success) {
        message.success('操作成功');
        const userRsp = await getUserInfoService();
        if (rsp.code !== ResponseCode.Success) {
          message.error(rsp.msg);
        } else {
          setInitialState({ userInfo: userRsp.data });
        }
      } else {
        message.error(rsp.msg);
      }
    },
    { manual: true, throttleWait: 500 },
  );
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>个人资料</h1>
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
