/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-loop-func */
import { defaultValues } from '@/constants';
import { MatchCaseEnum } from '@/types';
import { getTextRelatedStyles } from '@/utils';
import { FloatingSearchBoxElement } from './floating-search-box';

// 是否打开搜索工具
let isOpen = false;
let config = defaultValues;
const searchResultEmptyText = '无结果';
let currentIndex = 1;
let searchBox = null as FloatingSearchBoxElement | null;
let matchCase = MatchCaseEnum.DontMatch;
const textContentParentNodesMap = new Map<HTMLElement, string>();
let needRenderHighlightParentNodes: HTMLElement[] = [];
let keyword = '';

function queryAllText() {
  textContentParentNodesMap.clear();
  const body = document.body;
  const elements = body.querySelectorAll('*') as unknown as HTMLElement[];
  recursionElementChildNodes(elements);
}

function recursionElementChildNodes(elements: HTMLElement[]) {
  elements.forEach((element) => {
    if (element.nodeType === Node.TEXT_NODE && !!element.textContent) {
      textContentParentNodesMap.set(
        element.parentNode as unknown as HTMLElement,
        element.textContent,
      );
    } else if (element?.childNodes?.length > 0) {
      recursionElementChildNodes(
        element?.childNodes as unknown as HTMLElement[],
      );
    }
  });
}

// 往页面插入一个悬浮框
function insertSearchBox() {
  searchBox = document.createElement(
    'floating-search-box',
  ) as FloatingSearchBoxElement;
  document.documentElement.appendChild(searchBox);
  searchBox.addEventListener('setting', () => {
    chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
      if (response.status === 'success') {
        console.log('侧边栏已打开');
      } else {
        console.error('打开侧边栏失败');
      }
    });
  });
  searchBox.addEventListener('search', queryText);
  searchBox.addEventListener('matchcasechange', matchCaseChange);
  searchBox.addEventListener('close', closeSearchBox);
}

function matchCaseChange(e: any) {
  const newMatchCase = e?.detail as MatchCaseEnum;
  matchCase = newMatchCase;
  queryText(keyword);
}
// 关闭搜索工具
function closeSearchBox() {
  searchBox?.remove();
  searchBox = null;
  textContentParentNodesMap.clear();
  needRenderHighlightParentNodes = [];
  keyword = '';
  isOpen = false;
}

function queryText(e: any) {
  queryAllText();
  needRenderHighlightParentNodes = [];
  keyword = typeof e === 'string' ? e : e.detail;
  // 在下面这个map里面搜索出对应的keyword
  for (const parentNode of textContentParentNodesMap.keys()) {
    const value = textContentParentNodesMap.get(parentNode);
    if (keyword && value) {
      if (matchCase === MatchCaseEnum.Match && value.includes(keyword)) {
        needRenderHighlightParentNodes.push(parentNode);
      } else if (
        matchCase === MatchCaseEnum.DontMatch &&
        value?.toLowerCase().includes(keyword?.toLowerCase())
      ) {
        needRenderHighlightParentNodes.push(parentNode);
      }
    }
  }

  // 所有相关父节点算出来之后，更换里面的内容
  for (let i = 0; i < needRenderHighlightParentNodes.length; i++) {
    const parentNode = needRenderHighlightParentNodes[i];
    highlightKeyword(parentNode, keyword);
  }

  if (searchBox?.shadowRoot?.querySelector('#search-result')) {
    searchBox.shadowRoot.querySelector('#search-result')!.textContent =
      needRenderHighlightParentNodes.length
        ? `第${currentIndex}项，共${needRenderHighlightParentNodes.length}项`
        : searchResultEmptyText;
  }
}
// 获取所有文本节点
function getTextNodes(node: Node) {
  const textNodes = [] as Text[];
  if (node.nodeType === Node.TEXT_NODE) {
    textNodes.push(node as Text);
  } else {
    node.childNodes.forEach((child) => textNodes.push(...getTextNodes(child)));
  }
  return textNodes;
}
function highlightKeyword(parentNode: Node, keyword: string) {
  const textNodes = getTextNodes(parentNode);
  // 处理每个文本节点
  console.log('textNodes=', parentNode, textNodes);
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (text.includes(keyword)) {
      const parts = text.split(keyword);
      const fragment = document.createDocumentFragment();

      // 重建节点结构
      for (let i = 0; i < parts.length; i++) {
        // 添加普通文本
        if (parts[i]) {
          fragment.appendChild(document.createTextNode(parts[i]));
        }
        // 在非最后一部分后添加高亮关键词
        if (i < parts.length - 1) {
          const highlightEl = document.createElement('highlight');
          highlightEl.setAttribute(
            'data-styles',
            JSON.stringify({
              ...getTextRelatedStyles(textNode),
              'background-color': config.color,
            }),
          );
          highlightEl.textContent = keyword;
          fragment.appendChild(highlightEl);
        }
      }
      // 替换原始节点
      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  });
}

window.addEventListener('load', () => {
  // 生成script
  const script = document.createElement('script');
  // 使用chrome.runtime.getURL生成url
  script.src = chrome.runtime.getURL(
    'content-scripts/floating-search-box.js', // 注意：这里的路径也是基于插件项目根目录的路径
  );
  // 将script插入至页面的html文档中，使其运行环境是网页html
  document.documentElement.appendChild(script);
  // 先获取本地存储的信息
  chrome.storage.sync.get(['shortcut', 'color', 'fixed'], (result) => {
    config = {
      ...defaultValues,
      ...result,
    };
    const { shortcut } = config;
    console.log('====本地缓存已成功获取，可以继续执行后续逻辑====');
    console.log(`请按快捷键: ${shortcut.join('+')}打开搜索工具`);
    window.addEventListener('keydown', (e) => {
      // 把ctrlKey、shiftKey、altKey、metaKey筛选出来
      const shortcutWithSpecialKeys = shortcut.filter((item) =>
        ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].includes(item),
      );
      const shortcutKeys = shortcut.filter(
        (item) => !['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].includes(item),
      );
      if (
        shortcutWithSpecialKeys.every(
          (item: any) => e[item as keyof KeyboardEvent],
        ) &&
        shortcutKeys.every(
          (item: any) => e.key.toLowerCase() === item.toLowerCase(),
        )
      ) {
        console.log('成功打开搜索工具');
        if (!isOpen) {
          isOpen = true;
          insertSearchBox();
        }
      }
    });
  });
});
