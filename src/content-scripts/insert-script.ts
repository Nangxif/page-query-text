/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-loop-func */
import { defaultValues } from '@/constants';
import { MatchCaseEnum, Position } from '@/types';
import { isSameHighlight } from '@/utils';
import { FloatingSearchBoxElement } from './floating-search-box';

// 是否打开搜索工具
let isOpen = false;
let config = defaultValues;
const searchResultEmptyText = '无结果';
let currentIndex = 1;
let searchBox = null as FloatingSearchBoxElement | null;
let highlightContainer = null as HTMLElement | null;
let matchCase = MatchCaseEnum.DontMatch;
let prevPositionsMap: Map<Text, Position[]> = new Map();
const highlightNodesMap: Map<Text, HTMLDivElement[]> = new Map();
const penddingCutHighlightNodesIndexs = [] as number[];
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
  textContentMap.clear();
  resultsMap.clear();
  keyword = '';
  subscriber?.stop();
  subscriber = null;
  observer?.disconnect();
  observer = null;
  highlightContainer?.remove();
  highlightContainer = null;
  highlightNodesMap.clear();
  prevPositionsMap.clear();
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
    if (keyword && value) {
      if (matchCase === MatchCaseEnum.Match && value.includes(keyword)) {
        resultsMap.set(textNode, false);
      } else if (
        matchCase === MatchCaseEnum.DontMatch &&
        value?.toLowerCase().includes(keyword?.toLowerCase())
      ) {
        resultsMap.set(textNode, false);
      }
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
  const positionsMap = getTextPositionsMap(
    filterVisibleTextNodes(resultsMap),
    keyword,
  );
  console.log('positionsMap=', resultsMap, positionsMap, keyword);
  renderTextHighlight(positionsMap);
  subscriber = hitTextSubscriber();
  if (searchBox?.shadowRoot?.querySelector('#search-result')) {
    searchBox.shadowRoot.querySelector('#search-result')!.textContent =
      resultsMap.size
        ? `第${currentIndex}项，共${resultsMap.size}项`
        : searchResultEmptyText;
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
    const positionsMap = getTextPositionsMap(
      filterVisibleTextNodes(resultsMap),
      keyword,
    );
    renderTextHighlight(positionsMap);
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

function getTextPositionsMap(textNodes: Text[], keyword: string) {
  const textPositionsMap: Map<Text, Position[]> = new Map();
  textNodes.forEach((textNode) => {
    // 确保是文本节点
    const startIndexs = [];
    const text = textNode.textContent?.trim();
    // 在这里，可能个文字节点里面有多个与keyword匹配的文本，所以需要找到所有匹配的文本
    if (text) {
      if (matchCase === MatchCaseEnum.Match) {
        let startIndex = text.indexOf(keyword);
        while (startIndex > -1) {
          startIndexs.push(startIndex);
          startIndex = text.indexOf(keyword, startIndex + keyword.length);
        }
      } else {
        let startIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
        while (startIndex > -1) {
          startIndexs.push(startIndex);
          startIndex = text
            .toLowerCase()
            .indexOf(keyword.toLowerCase(), startIndex + keyword.length);
          console.log(text, keyword, startIndex);
        }
      }
    }
    const positions = [] as Position[];
    startIndexs.forEach((startIndex) => {
      const range = document.createRange();
      if (startIndex > -1) {
        range.setStart(textNode, startIndex); // 从文本节点的开始位置
        range.setEnd(textNode, startIndex + keyword.length); // 到文本节点的结束位置
      } else {
        range.setStart(textNode, 0); // 从文本节点的开始位置
        range.setEnd(textNode, textNode.length); // 到文本节点的结束位置
      }
      // 获取范围的边界矩形
      const rect = range.getBoundingClientRect();
      positions.push({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        transformX: 0,
        transformY: 0,
      });
    });
    textPositionsMap.set(textNode, positions);
  });

  return textPositionsMap;
}

function renderTextHighlight(nextPositionsMap: Map<Text, Position[]>) {
  if (!highlightContainer) {
    highlightContainer = document.createElement('div');
    highlightContainer.id = 'highlight';
    highlightContainer.style.position = 'fixed';
    highlightContainer.style.top = '0';
    highlightContainer.style.left = '0';
    highlightContainer.style.width = '100%';
    highlightContainer.style.height = '100%';
    highlightContainer.style.zIndex = '1000';
    highlightContainer.style.pointerEvents = 'none';
    // 不挂在body上，减少被误更改样式的概率
    document.documentElement.appendChild(highlightContainer);
  }
  for (const textNode of nextPositionsMap.keys()) {
    const prevPositions = prevPositionsMap.get(textNode);
    const nextPositions = nextPositionsMap.get(textNode)!;

    if (prevPositions) {
      // 如果上一次渲染有并且位置不一样，那么就更新位置
      for (let i = 0; i < nextPositions.length; i++) {
        if (isSameHighlight(prevPositions[i], nextPositions[i])) {
          continue;
        }
        if (!prevPositions[i]) {
          // 创建后面剩余的
          renderTextHighlightNode(textNode, nextPositions[i], i);
        } else {
          updateTextHighlightNode(
            textNode,
            prevPositions[i],
            nextPositions[i],
            i,
          );
        }
      }
      const cutLength =
        prevPositions.length - nextPositions.length > 0
          ? prevPositions.length - nextPositions.length
          : 0;
      if (cutLength > 0) {
        for (let i = nextPositions.length - 1; i < prevPositions?.length; i++) {
          removeTextHighlightNode(textNode, i);
        }
        const highlightNodes = highlightNodesMap.get(textNode)!;
        highlightNodesMap.set(
          textNode,
          highlightNodes.filter(
            (_, index) => !penddingCutHighlightNodesIndexs?.includes(index),
          ),
        );
      }
    } else {
      // 如果这个文本节点没有上一次渲染，那么就渲染所有位置
      nextPositions.forEach((position, index) => {
        renderTextHighlightNode(textNode, position, index);
      });
    }
  }
  // 清除已经不存在的highlight
  console.log('prevPositionsMap=', prevPositionsMap);
  for (const textNode of prevPositionsMap.keys()) {
    if (!nextPositionsMap.get(textNode)) {
      const highlightNodes = highlightNodesMap.get(textNode)!;
      console.log(highlightNodesMap, textNode, highlightNodes);
      highlightNodes.forEach((highlight) => {
        highlightContainer!.removeChild(highlight);
      });
      highlightNodesMap.delete(textNode);
    }
  }
  prevPositionsMap = nextPositionsMap;
}

function renderTextHighlightNode(
  textNode: Text,
  position: Position,
  index: number,
) {
  const highlight = document.createElement('div');
  highlight.style.position = 'absolute';
  highlight.style.top = `${position.top}px`;
  highlight.style.left = `${position.left}px`;
  highlight.style.width = `${position.width}px`;
  highlight.style.height = `${position.height}px`;
  highlight.style.backgroundColor = config.color;
  highlight.style.opacity = '0.6';
  highlight.setAttribute('data-index', index.toString());
  highlightContainer!.appendChild(highlight);
  let highlightNodes = highlightNodesMap.get(textNode) || [];
  highlightNodes[index] = highlight;
  highlightNodesMap.set(textNode, highlightNodes);
}

function updateTextHighlightNode(
  textNode: Text,
  prevPosition: Position,
  nextPosition: Position,
  index: number,
) {
  const highlightNodes = highlightNodesMap.get(textNode)!;
  const highlight = highlightNodes[index];
  if (highlight) {
    const x = nextPosition.left - prevPosition.left;
    const y = nextPosition.top - prevPosition.top;
    const transformX = prevPosition.transformX + x;
    const transformY = prevPosition.transformY + y;
    highlight.style.transform = `translate3d(${transformX}px,${transformY}px,0)`;
    highlight.style.width = `${nextPosition.width}px`;
    highlight.style.height = `${nextPosition.height}px`;
  }
}

function removeTextHighlightNode(textNode: Text, index: number) {
  const highlightNodes = highlightNodesMap.get(textNode)!;
  const highlight = highlightNodes[index];
  highlightContainer!.removeChild(highlight);
  penddingCutHighlightNodesIndexs.push(index);
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
