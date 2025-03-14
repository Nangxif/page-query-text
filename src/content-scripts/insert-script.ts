/* eslint-disable @typescript-eslint/no-use-before-define */
import { defaultValues } from '@/constants';
import CloseIcon from '../assets/images/close-icon.png';
import LowercaseIcon from '../assets/images/lowercase-icon.png';
import NextIcon from '../assets/images/next-icon.png';
import PrevIcon from '../assets/images/prev-icon.png';
import SettingsIcon from '../assets/images/setting-icon.png';
import UppercaseIcon from '../assets/images/uppercase-icon.png';

// 是否打开搜索工具
let isOpen = false;
let config = defaultValues;
const elementId = Date.now().toString();
const searchResultId = `${elementId}-search-result`;
const searchResultEmptyText = '无结果';
let floatingBox = null as HTMLElement | null;
let highlightContainer = null as HTMLElement | null;
let searchResultElement = null as HTMLElement | null;

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
function insertFloatBox() {
  // 创建悬浮框
  floatingBox = document.createElement('div');
  floatingBox.style.display = 'flex';
  floatingBox.style.alignItems = 'center';
  floatingBox.style.position = 'fixed';
  floatingBox.style.top = '20px';
  floatingBox.style.right = '20px';
  floatingBox.style.width = 'calc(100vw - 40px)';
  floatingBox.style.maxWidth = '400px';
  floatingBox.style.padding = '6px 4px';
  floatingBox.style.backgroundColor = 'rgb(32 32 32)'; // 深色背景
  floatingBox.style.borderRadius = '4px';
  floatingBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
  floatingBox.style.zIndex = '1000000';

  // 设置按钮
  const settingButtonBox = document.createElement('div');
  settingButtonBox.style.width = '24px';
  settingButtonBox.style.height = '24px';
  settingButtonBox.style.display = 'flex';
  settingButtonBox.style.alignItems = 'center';
  settingButtonBox.style.justifyContent = 'center';
  settingButtonBox.style.cursor = 'pointer';
  settingButtonBox.style.borderRadius = '4px';
  settingButtonBox.style.marginRight = '4px';
  settingButtonBox.onmouseenter = () => {
    settingButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  settingButtonBox.onmouseleave = () => {
    settingButtonBox.style.backgroundColor = 'transparent';
  };
  settingButtonBox.onclick = () => {
    chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
      if (response.status === 'success') {
        console.log('侧边栏已打开');
      } else {
        console.error('打开侧边栏失败');
      }
    });
  };
  const settingButton = document.createElement('div');
  settingButton.innerHTML = `<img src="${SettingsIcon}" alt="settings" />`;
  settingButton.style.width = '16px';
  settingButton.style.height = '16px';
  settingButton.style.cursor = 'pointer';
  settingButtonBox.appendChild(settingButton);
  floatingBox.appendChild(settingButtonBox);

  // 创建输入框
  const inputBox = document.createElement('div');
  inputBox.style.flex = '1';
  inputBox.style.display = 'flex';
  inputBox.style.alignItems = 'center';
  inputBox.style.width = '100%';
  inputBox.style.height = '26px';
  inputBox.style.borderRadius = '4px';
  inputBox.style.border = 'none';
  inputBox.style.overflow = 'hidden';
  inputBox.style.background = 'rgb(49 49 49)';
  inputBox.style.marginRight = '12px';

  const input = document.createElement('input');
  input.type = 'text';
  input.style.flex = '1';
  input.placeholder = '查找';
  input.style.width = '100%';
  input.style.height = '26px';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.color = 'white';
  input.style.fontSize = '14px';
  input.style.padding = '0 10px';
  input.style.background = 'transparent';
  // 绑定事件，当输入框内容变化时，调用search函数
  input.oninput = queryText;

  const uppercaseButtonBox = document.createElement('div');
  uppercaseButtonBox.style.width = '22px';
  uppercaseButtonBox.style.height = '22px';
  uppercaseButtonBox.style.display = 'flex';
  uppercaseButtonBox.style.alignItems = 'center';
  uppercaseButtonBox.style.justifyContent = 'center';
  uppercaseButtonBox.style.cursor = 'pointer';
  uppercaseButtonBox.style.borderRadius = '4px';
  uppercaseButtonBox.style.marginRight = '4px';
  uppercaseButtonBox.onmouseenter = () => {
    uppercaseButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  uppercaseButtonBox.onmouseleave = () => {
    uppercaseButtonBox.style.backgroundColor = 'transparent';
  };
  const uppercaseButton = document.createElement('div');
  uppercaseButton.innerHTML = `<img src="${UppercaseIcon}" alt="uppercase" />`;
  uppercaseButton.style.background = 'none';
  uppercaseButton.style.border = 'none';
  uppercaseButton.style.color = 'white';
  uppercaseButton.style.width = '18px';
  uppercaseButton.style.height = '18px';
  uppercaseButtonBox.appendChild(uppercaseButton);

  const lowercaseButtonBox = document.createElement('div');
  lowercaseButtonBox.style.width = '22px';
  lowercaseButtonBox.style.height = '22px';
  lowercaseButtonBox.style.display = 'flex';
  lowercaseButtonBox.style.alignItems = 'center';
  lowercaseButtonBox.style.justifyContent = 'center';
  lowercaseButtonBox.style.cursor = 'pointer';
  lowercaseButtonBox.style.borderRadius = '4px';
  lowercaseButtonBox.style.marginRight = '4px';
  lowercaseButtonBox.onmouseenter = () => {
    lowercaseButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  lowercaseButtonBox.onmouseleave = () => {
    lowercaseButtonBox.style.backgroundColor = 'transparent';
  };
  const lowercaseButton = document.createElement('div');
  lowercaseButton.innerHTML = `<img src="${LowercaseIcon}" alt="lowercase" />`;
  lowercaseButton.style.background = 'none';
  lowercaseButton.style.border = 'none';
  lowercaseButton.style.color = 'white';
  lowercaseButton.style.width = '18px';
  lowercaseButton.style.height = '18px';
  lowercaseButtonBox.appendChild(lowercaseButton);

  inputBox.appendChild(input);
  inputBox.appendChild(uppercaseButtonBox);
  inputBox.appendChild(lowercaseButtonBox);

  // 将输入框添加到内容区域
  floatingBox.appendChild(inputBox);

  // 搜索结果
  const searchResult = document.createElement('div');
  searchResult.id = searchResultId;
  searchResult.textContent = searchResultEmptyText;
  searchResult.style.color = 'white';
  searchResult.style.fontSize = '13px';
  searchResult.style.marginRight = '12px';
  searchResultElement = searchResult;
  floatingBox.appendChild(searchResult);

  const prevButtonBox = document.createElement('div');
  prevButtonBox.style.width = '24px';
  prevButtonBox.style.height = '24px';
  prevButtonBox.style.display = 'flex';
  prevButtonBox.style.alignItems = 'center';
  prevButtonBox.style.justifyContent = 'center';
  prevButtonBox.style.cursor = 'pointer';
  prevButtonBox.style.borderRadius = '4px';
  prevButtonBox.style.marginRight = '4px';
  prevButtonBox.onmouseenter = () => {
    prevButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  prevButtonBox.onmouseleave = () => {
    prevButtonBox.style.backgroundColor = 'transparent';
  };
  const prevButton = document.createElement('div');
  prevButton.innerHTML = `<img src="${PrevIcon}" alt="prev" />`;
  prevButton.style.background = 'none';
  prevButton.style.border = 'none';
  prevButton.style.color = 'white';
  prevButton.style.width = '16px';
  prevButton.style.height = '16px';
  prevButtonBox.appendChild(prevButton);

  const nextButtonBox = document.createElement('div');
  nextButtonBox.style.width = '24px';
  nextButtonBox.style.height = '24px';
  nextButtonBox.style.display = 'flex';
  nextButtonBox.style.alignItems = 'center';
  nextButtonBox.style.justifyContent = 'center';
  nextButtonBox.style.cursor = 'pointer';
  nextButtonBox.style.borderRadius = '4px';
  nextButtonBox.style.marginRight = '4px';
  nextButtonBox.onmouseenter = () => {
    nextButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  nextButtonBox.onmouseleave = () => {
    nextButtonBox.style.backgroundColor = 'transparent';
  };
  const nextButton = document.createElement('div');
  nextButton.innerHTML = `<img src="${NextIcon}" alt="next" />`;
  nextButton.style.background = 'none';
  nextButton.style.border = 'none';
  nextButton.style.color = 'white';
  nextButton.style.width = '16px';
  nextButton.style.height = '16px';
  nextButtonBox.appendChild(nextButton);

  // 创建关闭按钮
  const closeButtonBox = document.createElement('div');
  closeButtonBox.style.width = '24px';
  closeButtonBox.style.height = '24px';
  closeButtonBox.style.display = 'flex';
  closeButtonBox.style.alignItems = 'center';
  closeButtonBox.style.justifyContent = 'center';
  closeButtonBox.style.cursor = 'pointer';
  closeButtonBox.style.borderRadius = '4px';
  closeButtonBox.style.marginRight = '4px';
  closeButtonBox.onmouseenter = () => {
    closeButtonBox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  };
  closeButtonBox.onmouseleave = () => {
    closeButtonBox.style.backgroundColor = 'transparent';
  };
  const closeButton = document.createElement('div');
  closeButton.innerHTML = `<img src="${CloseIcon}" alt="close" />`;
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.width = '16px';
  closeButton.style.height = '16px';
  closeButton.style.margin = '0 4px';
  closeButtonBox.appendChild(closeButton);

  closeButton.onclick = closeSearchTool;

  floatingBox.appendChild(prevButtonBox);
  floatingBox.appendChild(nextButtonBox);
  floatingBox.appendChild(closeButtonBox);

  // 将悬浮框添加到文档中
  document.documentElement.appendChild(floatingBox);
}

// 关闭搜索工具
function closeSearchTool() {
  // 清除搜索框
  floatingBox?.remove();
  floatingBox = null;
  textContentMap.clear();
  resultsMap.clear();
  keyword = '';
  subscriber?.stop();
  subscriber = null;
  observer?.disconnect();
  observer = null;
  searchResultElement = null;
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
  keyword = typeof e === 'string' ? e : e.target.value;
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
  searchResultElement!.textContent = resultsMap.size
    ? `第1项，共${resultsMap.size}项`
    : searchResultEmptyText;
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
    searchResultElement!.textContent = resultsMap.size
      ? `第1项，共${resultsMap.size}项`
      : searchResultEmptyText;
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
        shortcutKeys.every((item: any) => e.key === item)
      ) {
        console.log('成功打开搜索工具');
        if (!isOpen) {
          isOpen = true;
          const timer = setTimeout(() => {
            generateTextMap();
            clearTimeout(timer);
          }, 1000);
          insertFloatBox();
        }
      }
    });
  });
});
