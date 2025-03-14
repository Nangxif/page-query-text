/* eslint-disable @typescript-eslint/no-use-before-define */
import { defaultValues } from '@/constants';
import { FloatingSearchBoxElement } from './floating-search-box';

// 是否打开搜索工具
let isOpen = false;
let config = defaultValues;
const searchResultEmptyText = '无结果';
let searchBox = null as FloatingSearchBoxElement | null;
let highlightContainer = null as HTMLElement | null;

const textContentMap = new Map() as Map<Text, string>;
let keyword = '';

// 生成当前页面文本Map
function generateTextMap() {
  const observer = new MutationObserver(() => {
    getAllText();
    queryText(keyword);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  getAllText();
}

function getAllText() {
  textContentMap.clear();
  const body = document.body;
  const elements = body.querySelectorAll('*') as unknown as HTMLElement[];
  recursionElementChildNodes(elements);
}

function recursionElementChildNodes(elements: HTMLElement[]) {
  elements.forEach((element) => {
    if (element.nodeType === Node.TEXT_NODE && !!element.textContent) {
      textContentMap.set(element as unknown as Text, element.textContent);
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
  searchBox.addEventListener('close', closeSearchBox);
}

// 关闭搜索工具
function closeSearchBox() {
  searchBox?.remove();
  searchBox = null;
  textContentMap.clear();
  resultsMap.clear();
  keyword = '';
  subscriber?.stop();
  subscriber = null;
  observer?.disconnect();
  observer = null;
  highlightContainer?.remove();
  highlightContainer = null;
  isOpen = false;
}

let subscriber: {
  start: () => void;
  stop: () => void;
} | null = null;
let observer: IntersectionObserver | null = null;
const resultsMap = new Map<Text, boolean>();
function queryText(e: any) {
  subscriber?.stop();
  subscriber = null;
  observer?.disconnect();
  observer = null;
  resultsMap.clear();
  keyword = typeof e === 'string' ? e : e.detail;
  // 在下面这个map里面搜索出对应的keyword
  for (const textNode of textContentMap.keys()) {
    const value = textContentMap.get(textNode);
    if (keyword && value && value.includes(keyword)) {
      resultsMap.set(textNode, false);
    }
  }

  // 监听results里面每个节点是否在可视区
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry?.target?.childNodes.forEach((child) => {
        if (child?.nodeType === Node.TEXT_NODE) {
          resultsMap.set(child as unknown as Text, entry.isIntersecting);
        }
      });
    });
  });
  for (const textNode of resultsMap.keys()) {
    observer!.observe(textNode.parentElement as HTMLElement);
  }
  const positions = getTextPosition(
    filterVisibleTextNodes(resultsMap),
    keyword,
  );
  renderTextHighlight(positions);
  subscriber = hitTextSubscriber();
  if (searchBox?.shadowRoot?.querySelector('#search-result')) {
    searchBox.shadowRoot.querySelector('#search-result')!.textContent =
      resultsMap.size ? `第1项，共${resultsMap.size}项` : searchResultEmptyText;
  }
}

// 过滤出可见的文本节点，通过数组返回
function filterVisibleTextNodes(resultsMap: Map<Text, boolean>) {
  const results: Text[] = [];
  for (const textNode of resultsMap.keys()) {
    if (resultsMap.get(textNode)) {
      results.push(textNode);
    }
  }
  return results;
}

function hitTextSubscriber() {
  const subscriber = requestAnimationFrameLoop(() => {
    const positions = getTextPosition(
      filterVisibleTextNodes(resultsMap),
      keyword,
    );
    renderTextHighlight(positions);
    if (searchBox?.shadowRoot?.querySelector('#search-result')) {
      searchBox.shadowRoot.querySelector('#search-result')!.textContent =
        resultsMap.size
          ? `第1项，共${resultsMap.size}项`
          : searchResultEmptyText;
    }
  });
  subscriber.start();
  return subscriber;
}

function requestAnimationFrameLoop(callback: () => void) {
  let requestId: number;
  function loop() {
    requestId = requestAnimationFrame(loop);
    callback();
  }
  return {
    start: () => {
      loop();
    },
    stop: () => {
      cancelAnimationFrame(requestId);
    },
  };
}

function getTextPosition(textNodes: Text[], keyword: string) {
  const textPositions: {
    top: number;
    left: number;
    width: number;
    height: number;
  }[] = [];
  textNodes.forEach((textNode) => {
    // 确保是文本节点
    const range = document.createRange();
    const startIndex = textNode.textContent?.indexOf(keyword) || 0;
    if (startIndex > -1) {
      range.setStart(textNode, startIndex); // 从文本节点的开始位置
      range.setEnd(textNode, startIndex + (keyword?.length || 0)); // 到文本节点的结束位置
    } else {
      range.setStart(textNode, 0); // 从文本节点的开始位置
      range.setEnd(textNode, textNode.length); // 到文本节点的结束位置
    }

    // 获取范围的边界矩形
    const rect = range.getBoundingClientRect();
    textPositions.push({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  });

  return textPositions;
}

function renderTextHighlight(
  positions: {
    top: number;
    left: number;
    width: number;
    height: number;
  }[],
) {
  // 先清除上一次的highlight
  highlightContainer = document.querySelector('#highlight');
  highlightContainer?.remove();
  highlightContainer = null;
  if (positions?.length === 0) return;
  highlightContainer = document.createElement('div');
  highlightContainer.id = 'highlight';
  highlightContainer.style.position = 'fixed';
  highlightContainer.style.top = '0';
  highlightContainer.style.left = '0';
  highlightContainer.style.width = '100%';
  highlightContainer.style.height = '100%';
  highlightContainer.style.zIndex = '1000';
  highlightContainer.style.pointerEvents = 'none';
  document.documentElement.appendChild(highlightContainer);

  positions.forEach((position) => {
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.top = `${position.top}px`;
    highlight.style.left = `${position.left}px`;
    highlight.style.width = `${position.width}px`;
    highlight.style.height = `${position.height}px`;
    highlight.style.backgroundColor = config.color;
    highlight.style.opacity = '0.6';
    highlightContainer!.appendChild(highlight);
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
          const timer = setTimeout(() => {
            generateTextMap();
            clearTimeout(timer);
          }, 1000);
          insertSearchBox();
        }
      }
    });
  });
});
