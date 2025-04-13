import { ConfigProvider } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { theme as antTheme } from '../config/antdTheme';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider theme={antTheme}>
      <HelmetProvider>{children}</HelmetProvider>
    </ConfigProvider>
  );
};

export default Layout;
