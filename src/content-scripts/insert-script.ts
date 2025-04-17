/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  codeMessage,
  defaultConfig,
  ResponseCode,
} from '@/constants/content-scripts';
import { pageQueryTextDataBase } from '@/db';
import { SummaryResult } from '@/db/model';
import {
  LoadingEnum,
  MatchCaseEnum,
  NotificationType,
  ResponseError,
  TextSelectionType,
} from '@/types';
import {
  debounceFn,
  getTextRelatedStyles,
  isExactMatch,
  splitText,
} from '@/utils';
import { FloatingSearchBoxElement } from './floating-search-box';
import { NotificationBoxElement } from './notification-box';
import { SummaryParams, summaryService } from './service';

// 是否打开搜索工具
let isOpen = false;
// 默认的配置
let config = defaultConfig;
const searchResultEmptyText = '无结果';
// 搜索关键字最高亮索引
let currentIndex = 1;
// 搜索框
let searchBox = null as FloatingSearchBoxElement | null;
// 通知框
let notificationBox = null as NotificationBoxElement | null;
// 关注大小写
let matchCase = MatchCaseEnum.DontMatch;
const textContentParentNodesMap = new Map<HTMLElement, string[]>();
let needRenderHighlightParentNodes: {
  parentNode: HTMLElement;
  originChildNodes: Node[];
}[] = [];
let highlightNodes: HTMLElement[] = [];
let keyword = '';
let summaryPage = 0;
let summaryTotalPage = 0;
let summaryResultList: SummaryResult[] = [];

function queryAllText() {
  textContentParentNodesMap.clear();
  const body = document.body;
  const elements = body.querySelectorAll('*') as unknown as HTMLElement[];
  recursionElementChildNodes(elements);
}

function isElementTagVisible(element: HTMLElement) {
  let current = element;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      // 跳过特定标签
      if (
        current.nodeName === 'SCRIPT' ||
        current.nodeName === 'NOSCRIPT' ||
        current.nodeName === 'STYLE'
      ) {
        return false;
      }
    }
    current = current.parentNode as HTMLElement;
  }

  return true;
}

function isElementStyleVisible(element: HTMLElement) {
  let current = element;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
        // (style.width === '0px' && style.overflow !== 'visible') ||
        // (style.height === '0px' && style.overflow !== 'visible')
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
    if (!isElementTagVisible(element)) {
      continue;
    }

    // 处理文本节点
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent?.trim();
      if (text) {
        const texts =
          textContentParentNodesMap.get(element.parentNode as HTMLElement) ||
          [];
        if (!texts?.includes(text)) {
          texts.push(text);
        }
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
  // 获取当前页面选中的内容
  const currentSelectedContent = document.getSelection()?.toString();
  currentSelectedContent &&
    searchBox.setAttribute('data-selected-content', currentSelectedContent);
  document.documentElement.appendChild(searchBox);
  searchBox.addEventListener('setting', openSetting);
  searchBox.addEventListener('opensummary', openSummary);
  searchBox.addEventListener('summary', summaryPageText);
  searchBox.addEventListener('moresummary', openSummaryResultListSidebar);
  const queryTextFn = debounceFn(queryText, 500);
  searchBox.addEventListener('search', queryTextFn);
  searchBox.addEventListener('matchcasechange', matchCaseChange);
  searchBox.addEventListener('searchprevious', searchPrevious);
  searchBox.addEventListener('searchnext', searchNext);
  searchBox.addEventListener('move', moveSearchBox);
  searchBox.addEventListener('close', closeSearchBox);
  searchBox.addEventListener('summaryprev', summaryPrev);
  searchBox.addEventListener('summarynext', summaryNext);
}

function summaryPrev() {
  if (summaryPage > 1) {
    summaryPage--;
    searchBox?.setAttribute('data-summary-page', summaryPage.toString());
    searchBox?.setAttribute(
      'data-summary-text-content',
      summaryResultList[summaryPage - 1].summary,
    );
  }
}

function summaryNext() {
  if (summaryPage < summaryTotalPage) {
    summaryPage++;
    searchBox?.setAttribute('data-summary-page', summaryPage.toString());
    searchBox?.setAttribute(
      'data-summary-text-content',
      summaryResultList[summaryPage - 1].summary,
    );
  }
}

// 更新搜索内容
function updateSearchContent() {
  // 获取当前页面选中的内容
  const currentSelectedContent = document.getSelection()?.toString();
  currentSelectedContent &&
    searchBox!.setAttribute('data-selected-content', currentSelectedContent);
}

// 移动
function moveSearchBox(e: any) {
  const detail = e.detail;
  const { startX, startY } = detail;
  chrome.storage.local.set({
    startX,
    startY,
  });
}

// 向前查找
function searchPrevious() {
  if (highlightNodes.length === 0) {
    return;
  }
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
  renderSearchResult();
  highlightNodes[currentIndex - 1].scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

// 向后查找
function searchNext() {
  if (highlightNodes.length === 0) {
    return;
  }
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
  renderSearchResult();
  highlightNodes[currentIndex - 1].scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

// 切换关注大小写开关
function matchCaseChange(e: any) {
  const newMatchCase = e?.detail as MatchCaseEnum;
  matchCase = newMatchCase;
  queryText(keyword);
}

function openSetting() {
  chrome.runtime.sendMessage({ action: 'openSettingSidePanel' });
}

function queryText(e: any) {
  searchBox?.setAttribute('data-loading', LoadingEnum.Loading);
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
        texts?.some((text) =>
          isExactMatch(text, keyword, matchCase === MatchCaseEnum.Match),
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

  // 这里要过滤掉祖先节点样式有display: none的节点
  needRenderHighlightParentNodes = needRenderHighlightParentNodes.filter(
    (node) => isElementStyleVisible(node.parentNode),
  );
  // 所有相关父节点算出来之后，更换里面的内容
  for (let i = 0; i < needRenderHighlightParentNodes.length; i++) {
    const node = needRenderHighlightParentNodes[i];
    renderHighlightKeyword(node.parentNode, keyword);
  }
  computedViewportClosestNodeAndScrollToIt();
  renderSearchResult();
  searchBox?.setAttribute('data-loading', LoadingEnum.Loaded);
}

// 计算出needRenderHighlightParentNodes里面的节点，距离当前可视区最近的，或者已经在可视区内的
function computedViewportClosestNodeAndScrollToIt() {
  if (highlightNodes.length > 0) {
    // 获取视口高度
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 找到视口内的节点或最近的节点
    let closestNode = highlightNodes[0];
    let minDistance = Infinity;

    for (let i = 0; i < highlightNodes.length; i++) {
      const node = highlightNodes[i];
      const rect = node.getBoundingClientRect();

      // 检查节点是否在视口内
      if (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.right <= viewportWidth
      ) {
        // 节点在视口内，设置为当前节点并跳出循环
        closestNode = node;
        currentIndex = i + 1;
        break;
      }

      // 计算节点到视口中心的距离
      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;
      const nodeCenterX = (rect.left + rect.right) / 2;
      const nodeCenterY = (rect.top + rect.bottom) / 2;

      const distance = Math.sqrt(
        Math.pow(nodeCenterX - viewportCenterX, 2) +
          Math.pow(nodeCenterY - viewportCenterY, 2),
      );

      // 更新最近的节点
      if (distance < minDistance) {
        minDistance = distance;
        closestNode = node;
        currentIndex = i + 1;
      }
    }

    // 高亮显示最近或视口内的节点
    updateKeywordStyle(closestNode, {
      color: config.selectedColor,
      'background-color': config.selectedBgColor,
    });

    // 如果节点不在视口内，滚动到该节点
    const rect = closestNode.getBoundingClientRect();
    if (
      rect.top < 0 ||
      rect.left < 0 ||
      rect.bottom > viewportHeight ||
      rect.right > viewportWidth
    ) {
      closestNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function renderSearchResult() {
  if (searchBox?.shadowRoot?.querySelector('#search-result')) {
    searchBox.shadowRoot.querySelector('#search-result')!.textContent =
      highlightNodes.length
        ? `第${currentIndex}项，共${highlightNodes.length}项`
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
      const parts = splitText(text, keyword, matchCase === MatchCaseEnum.Match);
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

// 关闭搜索工具
function closeSearchBox() {
  searchBox?.remove();
  searchBox = null;
  textContentParentNodesMap.clear();
  matchCase = MatchCaseEnum.DontMatch;
  resetNeedRenderHighlightParentNodes();
  needRenderHighlightParentNodes = [];
  highlightNodes = [];
  keyword = '';
  currentIndex = 1;
  isOpen = false;
}

// 往页面插入一个通知框
function insertNotificationBox() {
  notificationBox = document.createElement(
    'notification-box',
  ) as NotificationBoxElement;
  document.documentElement.appendChild(notificationBox);
}

function showNotification(params: {
  title: string;
  content: string;
  duration: number;
  type: NotificationType;
  actionText?: string;
  actionCallback?: () => void;
}) {
  notificationBox?.setAttribute('data-show', 'true');
  notificationBox?.setAttribute('data-title', params.title);
  notificationBox?.setAttribute('data-content', params.content);
  notificationBox?.setAttribute('data-duration', params.duration.toString());
  notificationBox?.setAttribute('data-type', params.type);
  // 检查notificationBox里面是否有notification-action
  if (params.actionText) {
    const oldNotificationAction = notificationBox?.querySelector(
      'notification-action',
    );
    if (oldNotificationAction) {
      // 先清除
      notificationBox?.removeChild(oldNotificationAction);
    }
    const notificationAction = document.createElement('notification-action');
    notificationBox?.appendChild(notificationAction);
    notificationAction.setAttribute('data-action-text', params.actionText);
    notificationAction?.addEventListener(
      'click',
      params?.actionCallback || (() => void 0),
    );
  }
}

async function openSummary() {
  searchBox?.setAttribute('data-open-summary', 'true');
  searchBox?.setAttribute('data-summary-loading', LoadingEnum.Loading);
  searchBox?.setAttribute('data-summary-text-content', '');
  // 先从db获取summaryResultList
  summaryResultList = (await pageQueryTextDataBase.getSummaryResultList(
    window.location.href,
  )) as SummaryResult[];
  if (summaryResultList.length > 0) {
    searchBox?.setAttribute(
      'data-summary-text-content',
      summaryResultList[0].summary,
    );
    summaryPage = 1;
    summaryTotalPage = summaryResultList.length;
    searchBox?.setAttribute('data-summary-page', summaryPage.toString());
    searchBox?.setAttribute(
      'data-summary-total-page',
      summaryTotalPage.toString(),
    );
    searchBox?.setAttribute('data-summary-loading', LoadingEnum.Loaded);
    return;
  }
}

async function beginSummary(
  textSelectionType: TextSelectionType,
  params: SummaryParams,
) {
  try {
    const res = await summaryService(params);
    if (res?.code === ResponseCode.SUCCESS) {
      searchBox?.setAttribute('data-open-summary', 'true');
      searchBox?.setAttribute('data-summary-text-content', res?.data?.summary);
      searchBox?.setAttribute('data-summary-loading', LoadingEnum.Loaded);

      const result = {
        id: `${window.location.href}-${Date.now()}`,
        pageUrl: window.location.href,
        originalText: params.content,
        summary: res?.data?.summary,
        createdAt: Date.now(),
        model: params.model,
        promptTokens: res?.data?.tokenUsage?.promptTokens,
        completionTokens: res?.data?.tokenUsage?.completionTokens,
        totalTokens: res?.data?.tokenUsage?.totalTokens,
        timeUsed: res?.data?.timeUsed,
        textSelectionType,
      };
      pageQueryTextDataBase.addSummaryResult(result);
      summaryPage = 1;
      summaryTotalPage += 1;
      searchBox?.setAttribute('data-summary-page', summaryPage.toString());
      searchBox?.setAttribute(
        'data-summary-total-page',
        summaryTotalPage.toString(),
      );
      summaryResultList.unshift(result);
      if (textSelectionType === TextSelectionType.SelectionText) {
        showNotification({
          title: '提示',
          content: '已完成总结',
          duration: 0,
          type: NotificationType.Success,
          actionText: '前往查看',
          actionCallback: openSummaryResultListSidebar,
        });
      }
    } else {
      searchBox?.setAttribute(
        'data-summary-text-content',
        res?.message || '总结生成失败',
      );
      showNotification({
        title: '总结生成失败',
        content: res?.message || '请检查网络连接或稍后再试',
        duration: 3000,
        type: NotificationType.Error,
      });
    }
  } catch (error) {
    const errorData = error as ResponseError;
    const messgae = codeMessage[errorData?.statusCode] || '总结生成失败';
    searchBox?.setAttribute('data-summary-text-content', messgae);
    showNotification({
      title: '总结生成失败',
      content: messgae,
      duration: 0,
      type: NotificationType.Error,
      actionText: '前往登录',
      actionCallback: () => {
        chrome.runtime.sendMessage(
          { action: 'openTab', data: { url: 'Login.html' } },
          (response) => {
            if (response.status === 'success') {
              console.log('tab已打开');
            } else {
              console.error('打开tab失败');
            }
          },
        );
      },
    });
  } finally {
    searchBox?.setAttribute('data-summary-loading', LoadingEnum.Loaded);
  }
}

async function summaryPageText() {
  searchBox?.setAttribute('data-open-summary', 'true');
  searchBox?.setAttribute('data-summary-loading', LoadingEnum.Loading);
  searchBox?.setAttribute('data-summary-text-content', '');
  // 获取全文文本
  queryAllText();
  let totalTextContent = '';
  for (const parentNode of textContentParentNodesMap.keys()) {
    const texts = textContentParentNodesMap.get(parentNode);
    texts?.forEach((text) => {
      totalTextContent += `${text}\n`;
    });
  }
  if (!config?.model || !config?.apiKey) {
    return;
  }
  const summaryParams = {
    model: config.model,
    apiKey: config.apiKey,
    content: totalTextContent,
  };
  beginSummary(TextSelectionType.PageText, summaryParams);
}

async function summarySelectionText(selectionText: string) {
  notificationBox?.setAttribute('data-show', 'true');
  notificationBox?.setAttribute('data-title', '提示');
  notificationBox?.setAttribute('data-content', '正在总结...');
  notificationBox?.setAttribute('data-duration', '0');
  notificationBox?.setAttribute('data-type', NotificationType.Info);
  if (!config?.model || !config?.apiKey) {
    return;
  }
  const summaryParams = {
    model: config.model,
    apiKey: config.apiKey,
    content: selectionText,
  };
  beginSummary(TextSelectionType.SelectionText, summaryParams);
}

async function openSummaryResultListSidebar() {
  summaryResultList = (await pageQueryTextDataBase.getSummaryResultList(
    window.location.href,
  )) as SummaryResult[];
  chrome.runtime.sendMessage(
    {
      action: 'openSummaryResultListSidePanel',
    },
    (response) => {
      if (response.status === 'success') {
        setTimeout(() => {
          chrome.runtime.sendMessage({
            action: 'sendDataToSummaryResultListSidePanel',
            data: { summaryResultList, pageUrl: window.location.href },
          });
        }, 500);
      }
    },
  );
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

  // 生成script
  const notificationBoxScript = document.createElement('script');
  // 使用chrome.runtime.getURL生成url
  notificationBoxScript.src = chrome.runtime.getURL(
    'content-scripts/notification-box.js', // 注意：这里的路径也是基于插件项目根目录的路径
  );
  // 将script插入至页面的html文档中，使其运行环境是网页html
  document.documentElement.appendChild(notificationBoxScript);

  insertNotificationBox();

  // 先获取本地存储的信息
  chrome.storage.sync.get(
    [
      'shortcut',
      'color',
      'bgColor',
      'selectedColor',
      'selectedBgColor',
      'fixed',
      'model',
      'apiKey',
    ],
    (syncConfig) => {
      chrome.storage.local.get(['startX', 'startY'], (localConfig) => {
        config = {
          ...defaultConfig,
          ...syncConfig,
          ...localConfig,
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
            } else {
              updateSearchContent();
            }
          }
        });

        chrome.runtime.onMessage.addListener((request) => {
          if (request.action === 'insertSearchBox') {
            if (!isOpen) {
              isOpen = true;
              insertSearchBox();
            } else {
              updateSearchContent();
            }
          }
          if (request.action === 'summarySelection') {
            summarySelectionText(request.data.selectionText);
          }
        });
      });
    },
  );
});
