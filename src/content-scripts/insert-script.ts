/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-loop-func */
import { defaultValues } from '@/constants';
import { MatchCaseEnum } from '@/types';
import { debounceFn, getTextRelatedStyles, splitText } from '@/utils';
import { FloatingSearchBoxElement } from './floating-search-box';

// 是否打开搜索工具
let isOpen = false;
// 默认的配置
let config = defaultValues;
const searchResultEmptyText = '无结果';
let currentIndex = 1;
let searchBox = null as FloatingSearchBoxElement | null;
let matchCase = MatchCaseEnum.DontMatch;
const textContentParentNodesMap = new Map<HTMLElement, string[]>();
let needRenderHighlightParentNodes: {
  parentNode: HTMLElement;
  originChildNodes: Node[];
}[] = [];
let highlightNodes: HTMLElement[] = [];
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
        const texts =
          textContentParentNodesMap.get(element.parentNode as HTMLElement) ||
          [];
        texts.push(text);
        textContentParentNodesMap.set(element.parentNode as HTMLElement, texts);
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
  searchBox.setAttribute('data-fixed', config.fixed.toString());
  searchBox.setAttribute('data-startx', config.startX.toString());
  searchBox.setAttribute('data-starty', config.startY.toString());
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
  searchBox.addEventListener('searchprevious', searchPrevious);
  searchBox.addEventListener('searchnext', searchNext);
  searchBox.addEventListener('move', moveSearchBox);
  searchBox.addEventListener('close', closeSearchBox);
}

// 移动
function moveSearchBox(e: any) {
  const detail = e.detail;
  const { startX, startY } = detail;
  chrome.storage.sync.set({
    startX,
    startY,
  });
}

// 向前查找
function searchPrevious() {
  updateKeywordStyle(highlightNodes[currentIndex - 1], {
    color: config.color,
    'background-color': config.bgColor,
  });
  currentIndex =
    currentIndex - 1 < 1 ? highlightNodes.length : currentIndex - 1;
  updateKeywordStyle(highlightNodes[currentIndex - 1], {
    color: config.selectedColor,
    'background-color': config.selectedBgColor,
  });
  renderSearchResult(currentIndex, highlightNodes.length);
  highlightNodes[currentIndex - 1].scrollIntoView();
}

// 向后查找
function searchNext() {
  updateKeywordStyle(highlightNodes[currentIndex - 1], {
    color: config.color,
    'background-color': config.bgColor,
  });
  currentIndex =
    currentIndex + 1 > highlightNodes.length ? 1 : currentIndex + 1;

  updateKeywordStyle(highlightNodes[currentIndex - 1], {
    color: config.selectedColor,
    'background-color': config.selectedBgColor,
  });
  renderSearchResult(currentIndex, highlightNodes.length);
  highlightNodes[currentIndex - 1].scrollIntoView();
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
  matchCase = MatchCaseEnum.DontMatch;
  needRenderHighlightParentNodes = [];
  keyword = '';
  currentIndex = 1;
  isOpen = false;
}

function queryText(e: any) {
  // 先把页面上的节点先恢复原状
  resetNeedRenderHighlightParentNodes();
  needRenderHighlightParentNodes = [];
  highlightNodes = [];
  queryAllText();
  keyword = typeof e === 'string' ? e : e.detail;
  // 在下面这个map里面搜索出对应的keyword
  for (const parentNode of textContentParentNodesMap.keys()) {
    const texts = textContentParentNodesMap.get(parentNode);
    if (keyword && texts && texts.length > 0) {
      if (
        matchCase === MatchCaseEnum.Match &&
        texts?.some((text) => text.includes(keyword))
      ) {
        const originChildNodes = Array.from(parentNode.childNodes).map((node) =>
          node.cloneNode(true),
        );
        needRenderHighlightParentNodes.push({
          parentNode,
          originChildNodes,
        });
      } else if (
        matchCase === MatchCaseEnum.DontMatch &&
        texts?.some((text) =>
          text?.toLowerCase().includes(keyword?.toLowerCase()),
        )
      ) {
        const originChildNodes = Array.from(parentNode.childNodes).map((node) =>
          node.cloneNode(true),
        );
        needRenderHighlightParentNodes.push({
          parentNode,
          originChildNodes,
        });
      }
    }
  }

  // 所有相关父节点算出来之后，更换里面的内容
  for (let i = 0; i < needRenderHighlightParentNodes.length; i++) {
    const node = needRenderHighlightParentNodes[i];
    renderHighlightKeyword(node.parentNode, keyword);
  }
  renderSearchResult(currentIndex, highlightNodes.length);
}

function renderSearchResult(currentIndex: number, total: number) {
  if (searchBox?.shadowRoot?.querySelector('#search-result')) {
    searchBox.shadowRoot.querySelector('#search-result')!.textContent = total
      ? `第${currentIndex}项，共${total}项`
      : searchResultEmptyText;
  }
}

function resetNeedRenderHighlightParentNodes() {
  for (let i = 0; i < needRenderHighlightParentNodes.length; i++) {
    const node = needRenderHighlightParentNodes[i];
    // 获取源节点的所有子节点
    const childNodes = node.originChildNodes;
    node.parentNode.replaceChildren(...childNodes);
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
function renderHighlightKeyword(parentNode: Node, keyword: string) {
  const textNodes = getTextNodes(parentNode);
  // 处理每个文本节点
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (
      (matchCase === MatchCaseEnum.Match && text.includes(keyword)) ||
      (matchCase === MatchCaseEnum.DontMatch &&
        text.toLowerCase().includes(keyword.toLowerCase()))
    ) {
      const parts = splitText(text, keyword, matchCase);
      const matchKeywords = Array.from(
        text.matchAll(
          new RegExp(keyword, matchCase === MatchCaseEnum.Match ? 'mg' : 'img'),
        ),
      ).map((item) => item.index);
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
            'background-color': config.bgColor,
            color: config.color,
          };
          const keywordTextNodeSpan = document.createElement('span');
          const originText = text.slice(
            matchKeywords[i],
            matchKeywords[i] + keyword.length,
          );
          const keywordTextNode = document.createTextNode(originText);
          highlightEl.setAttribute('data-styles', JSON.stringify(styles));
          keywordTextNodeSpan.appendChild(keywordTextNode);
          highlightEl.appendChild(keywordTextNodeSpan);
          fragment.appendChild(highlightEl);
          highlightNodes.push(highlightEl);
        }
      }
      // 替换原始节点
      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  });
}
// 渲染选中的样式
function updateKeywordStyle(
  highlightNode: HTMLElement,
  newStyles: Record<string, any>,
) {
  const styles = JSON.parse(highlightNode.dataset.styles || '{}');
  Object.entries(newStyles).forEach(([styleName, styleValue]) => {
    styles[styleName] = styleValue;
  });
  highlightNode.setAttribute('data-styles', JSON.stringify(styles));
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
  chrome.storage.sync.get(
    [
      'shortcut',
      'color',
      'bgColor',
      'selectedColor',
      'selectedBgColor',
      'fixed',
      'startX',
      'startY',
    ],
    (result) => {
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
          (item) =>
            !['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].includes(item),
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
    },
  );
});
