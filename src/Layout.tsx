import { ConfigProvider } from 'antd';
import { theme as antTheme } from '../config/antdTheme';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ConfigProvider theme={antTheme}>{children}</ConfigProvider>;
};

export default Layout;
