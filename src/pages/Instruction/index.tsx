import CloseIcon from '@/assets/images/close-icon.png';
import DragIcon from '@/assets/images/drag-icon.png';
import LogoIcon from '@/assets/images/logo.png';
import MatchCaseIcon from '@/assets/images/match-case-icon.png';
import MatchWholeTextIcon from '@/assets/images/match-whole-text-icon.png';
import NextIcon from '@/assets/images/next-icon.png';
import PrevIcon from '@/assets/images/prev-icon.png';
import SettingsIcon from '@/assets/images/setting-icon.png';
import { Button, Typography } from 'antd';
import styles from './index.less';

const { Title, Paragraph, Text } = Typography;
const Instruction = () => {
  return (
    <div className={styles.instruction}>
      <div className={styles['logo-box']}>
        <img src={LogoIcon} className={styles.logo} />
        <div className={styles['logo-box-right']}>
          <div className={styles.name}>PageQueryText</div>
          <div className={styles.desc}>复刻代码编辑器vscode的文本搜索插件</div>
        </div>
      </div>
      <Typography>
        <Title
          level={4}
          style={{
            color: 'white',
          }}
        >
          为何开发这个插件？
        </Title>

        <Paragraph
          style={{
            color: 'white',
          }}
        >
          <ul>
            <li>
              谷歌浏览器自带的搜索工具无法支持最基本的大小写筛选功能，给文本搜索带来了一些不便。而且也无法挪动位置工具的位置，有时候会挡住搜索结果。
            </li>
            <li>
              大致看了一些插件市场上的相关插件，有些功能太杂乱用户不一定都会用到，使用门槛高。再者，大多类似插件实现文字高亮的方式破坏原本页面的结构，或者很容易被其他页面入侵自定义的组件样式，这是我无法接受的。
            </li>
          </ul>
        </Paragraph>
      </Typography>
      <Typography>
        <Title
          level={4}
          style={{
            color: 'white',
          }}
        >
          如何使用文本搜索？
        </Title>

        <Paragraph
          style={{
            color: 'white',
          }}
        >
          <ul>
            <li>
              默认按键盘快捷键
              <Text
                code
                style={{
                  color: 'white',
                }}
              >
                Ctrl
              </Text>
              +
              <Text
                code
                style={{
                  color: 'white',
                }}
              >
                F
              </Text>
              打开搜索工具
            </li>
            <li>
              从左到右的控件依次为：“
              <img src={DragIcon} width={12} />
              拖拽”，“
              <img
                src={SettingsIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              设置”，“搜索输入框”，“
              <img
                src={MatchCaseIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              区分大小写搜索”，“
              <img
                src={MatchWholeTextIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              是否全匹配关键字搜索”，“
              <img
                src={PrevIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              向前搜索”，“
              <img
                src={NextIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              向后搜索”，“
              <img
                src={CloseIcon}
                style={{
                  width: '16px',
                  position: 'relative',
                  top: '3px',
                }}
              />
              关闭”
            </li>
            <li>
              点击“设置”按钮，打开设置面板，可以
              <ul>
                <li>在搜索控件可以拖拽的前提下，按住拖拽区域可以进行拖拽；</li>
                <li>设置打开搜索控制的快捷键；</li>
                <li>设置页面上命中关键字的文字的高亮颜色；</li>
                <li>设置页面上命中关键字的文字背景的高亮颜色；</li>
                <li>设置页面上当前查看的命中文字的高亮颜色；</li>
                <li>设置页面上当前查看的命中文字背景的高亮颜色；</li>
                <li>设置是否固定搜索工具在当前页面所在的位置。</li>
              </ul>
            </li>
            <li>
              点击“区分大小写搜索”按钮，可以开启和关闭区分大小写搜索的功能
            </li>
            <li>
              点击“是否全匹配关键字搜索”按钮，可以开启和关闭是否全匹配关键字搜索的功能，比如，如果开启全匹配关键字功能，在检索“你好”关键字时，需要“你好“二字前后为空格或者为标点符号才可命中搜索条件
            </li>
            <li>点击“向前搜索”按钮，可以在当前查看的高亮关键字往前跳一个</li>
            <li>
              点击“向后搜索”按钮，可以在当前查看的高亮关键字往后跳一个（注意：前后搜索按钮在正常的，简单的页面布局下可能可以实现从上到下或者从左到右的跳转，在复杂的页面下可能跳转位置无法预测）
            </li>
            <li>
              点击“关闭”按钮，可以关闭搜索工具，此时会清空关闭之前搜索的关键字以及重置工具上的功能按钮
            </li>
          </ul>
        </Paragraph>
      </Typography>

      <Button
        type="link"
        className={styles['return-btn']}
        onClick={() => {
          window.location.href = '/Sidebar.html';
        }}
      >
        返回设置页面
      </Button>

      <div className={styles['copy-right']}>©️该插件版权归Nangxif所有</div>
    </div>
  );
};
export default Instruction;
