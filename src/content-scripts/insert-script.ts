/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-loop-func */
import { defaultValues } from '@/constants';
import { MatchCaseEnum } from '@/types';
import { debounceFn, getTextRelatedStyles } from '@/utils';
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

function isElementVisible(element: HTMLElement) {
  let current = element;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      // 跳过特定标签
      if (
        current.nodeName === 'SCRIPT' ||
        current.nodeName === 'STYLE' ||
        current.nodeName === 'HIGHLIGHT'
      ) {
        return false;
      }

      const style = window.getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      ) {
        return false;
      }
    }
    current = current.parentNode as HTMLElement;
  }

  return true;
}

function recursionElementChildNodes(elements: HTMLElement[]) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    // 检查元素是否可见
    if (element.nodeType === Node.ELEMENT_NODE) {
      if (
        element.nodeName === 'SCRIPT' ||
        element.nodeName === 'STYLE' ||
        element.nodeName === 'HIGHLIGHT'
      ) {
        continue;
      }
    }

    // 对于所有节点，检查它们是否在可见的祖先链中
    if (!isElementVisible(element)) {
      continue;
    }

    // 处理文本节点
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent?.trim();
      if (text) {
        textContentParentNodesMap.set(element.parentNode as HTMLElement, text);
      }
    } else if (
      element.nodeType === Node.ELEMENT_NODE &&
      element.childNodes?.length > 0
    ) {
      recursionElementChildNodes(
        Array.from(element.childNodes) as HTMLElement[],
      );
    }
  }
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
  const queryTextFn = debounceFn(queryText, 500);
  searchBox.addEventListener('search', queryTextFn);
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
  console.log(e);
  queryAllText();
  // 先把页面上的节点先恢复原状
  resetNeedRenderHighlightParentNodes();
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

function resetNeedRenderHighlightParentNodes() {
  for (let i = 0; i < needRenderHighlightParentNodes.length; i++) {
    const parentNode = needRenderHighlightParentNodes[i];
    // 查找所有的 highlight 元素
    const highlightElements = parentNode.querySelectorAll('highlight');

    // 替换每个 highlight 元素为 "keyword" 文本
    highlightElements.forEach((element) => {
      // 创建文本节点
      const textNode = document.createTextNode(keyword);

      // 将 highlight 元素替换为文本节点
      element.parentNode!.replaceChild(textNode, element);
    });
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
          const highlightEl = document.createElement('highlight-box');
          const styles = {
            ...getTextRelatedStyles(textNode),
            'background-color': config.color,
          };
          const keywordTextNodeSpan = document.createElement('span');
          const keywordTextNode = document.createTextNode(keyword);
          highlightEl.setAttribute('data-styles', JSON.stringify(styles));
          keywordTextNodeSpan.appendChild(keywordTextNode);
          highlightEl.appendChild(keywordTextNodeSpan);
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
  const floatingSearchBoxScript = document.createElement('script');
  // 使用chrome.runtime.getURL生成url
  floatingSearchBoxScript.src = chrome.runtime.getURL(
    'content-scripts/floating-search-box.js', // 注意：这里的路径也是基于插件项目根目录的路径
  );
  // 将script插入至页面的html文档中，使其运行环境是网页html
  document.documentElement.appendChild(floatingSearchBoxScript);

  // 生成script
  const highlightBoxScript = document.createElement('script');
  // 使用chrome.runtime.getURL生成url
  highlightBoxScript.src = chrome.runtime.getURL(
    'content-scripts/highlight-box.js', // 注意：这里的路径也是基于插件项目根目录的路径
  );
  // 将script插入至页面的html文档中，使其运行环境是网页html
  document.documentElement.appendChild(highlightBoxScript);
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
