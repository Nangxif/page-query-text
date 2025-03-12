/* eslint-disable @typescript-eslint/no-use-before-define */

const textContentMap = new Map();
/**
 * 获取当前页面每个可滚动的元素（页面上任何一个节点都有可能可以滚动）的滚动宽度和滚动高度，生成一个数组，数组的格式为
 * [{
 *  scrollWidth: number,
 *  scrollHeight: number,
 *  left: number,
 *  top: number,
 *  width: number,
 *  height: number,
 * }]
 */
// function getScrollableElements() {
//   const observer = new MutationObserver((mutations) => {
//     console.log('mutations=', mutations);
//     mutations.forEach((mutation) => {});
//   });
//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });
// }

// 生成当前页面文本weakMap
function generateTextMap() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        const target = mutation.target as Text;
        textContentMap.set(target, target.textContent);
      }
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  // 获取body下面所有的节点，排除script节点
  const body = document.body;
  const elements = body.querySelectorAll('*');
  // WeakMap.prototype.set = function (key, value) {
  //   // 上报最新的map
  //   return WeakMap.prototype.set.call(this, key, value);
  // };
  elements.forEach((element) => {
    if (
      element.tagName !== 'SCRIPT' &&
      Array.from(element?.childNodes).some((child) => child.nodeType === 3)
    ) {
      if (!!element?.textContent?.trim()) {
        textContentMap.set(element, element.textContent);
      }
    }
  });
}

// 往页面插入一个输入框
function insertInput() {
  // 创建悬浮框
  const floatingBox = document.createElement('div');
  floatingBox.style.position = 'fixed';
  floatingBox.style.top = '20px';
  floatingBox.style.right = '20px';
  floatingBox.style.width = '300px';
  floatingBox.style.backgroundColor = '#333'; // 深色背景
  floatingBox.style.color = 'white';
  floatingBox.style.borderRadius = '8px';
  floatingBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
  floatingBox.style.padding = '10px';
  floatingBox.style.zIndex = '1000';

  // 创建头部
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'flex-end';

  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✖';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    floatingBox.style.display = 'none';
  };

  // 将关闭按钮添加到头部
  header.appendChild(closeButton);
  floatingBox.appendChild(header);

  // 创建内容区域
  const content = document.createElement('div');
  content.style.marginTop = '10px';

  // 创建输入框
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '搜索...';
  input.style.width = '100%';
  input.style.padding = '8px';
  input.style.border = 'none';
  input.style.borderRadius = '4px';
  input.style.marginBottom = '10px';
  input.style.color = 'black';
  // 绑定事件，当输入框内容变化时，调用search函数
  input.oninput = search;

  // 将输入框添加到内容区域
  content.appendChild(input);

  // 创建按钮区域
  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.justifyContent = 'space-between';
  buttons.style.marginBottom = '10px';

  // 创建 Aa 按钮
  const aaButton = document.createElement('button');
  aaButton.innerHTML = 'Aa';
  aaButton.style.backgroundColor = '#555';
  aaButton.style.color = 'white';
  aaButton.style.border = 'none';
  aaButton.style.padding = '8px 12px';
  aaButton.style.borderRadius = '4px';
  aaButton.style.cursor = 'pointer';
  aaButton.onmouseover = () => {
    aaButton.style.backgroundColor = '#777';
  };
  aaButton.onmouseout = () => {
    aaButton.style.backgroundColor = '#555';
  };

  // 创建 ab 按钮
  const abButton = document.createElement('button');
  abButton.innerHTML = 'ab';
  abButton.style.backgroundColor = '#555';
  abButton.style.color = 'white';
  abButton.style.border = 'none';
  abButton.style.padding = '8px 12px';
  abButton.style.borderRadius = '4px';
  abButton.style.cursor = 'pointer';
  abButton.onmouseover = () => {
    abButton.style.backgroundColor = '#777';
  };
  abButton.onmouseout = () => {
    abButton.style.backgroundColor = '#555';
  };

  // 将按钮添加到按钮区域
  buttons.appendChild(aaButton);
  buttons.appendChild(abButton);
  content.appendChild(buttons);

  // 创建导航区域
  const navigation = document.createElement('div');
  navigation.style.display = 'flex';
  navigation.style.justifyContent = 'space-between';

  // 创建上按钮
  const upButton = document.createElement('button');
  upButton.innerHTML = '↑';
  upButton.style.backgroundColor = '#555';
  upButton.style.color = 'white';
  upButton.style.border = 'none';
  upButton.style.padding = '8px 12px';
  upButton.style.borderRadius = '4px';
  upButton.style.cursor = 'pointer';
  upButton.onmouseover = () => {
    upButton.style.backgroundColor = '#777';
  };
  upButton.onmouseout = () => {
    upButton.style.backgroundColor = '#555';
  };

  // 创建下按钮
  const downButton = document.createElement('button');
  downButton.innerHTML = '↓';
  downButton.style.backgroundColor = '#555';
  downButton.style.color = 'white';
  downButton.style.border = 'none';
  downButton.style.padding = '8px 12px';
  downButton.style.borderRadius = '4px';
  downButton.style.cursor = 'pointer';
  downButton.onmouseover = () => {
    downButton.style.backgroundColor = '#777';
  };
  downButton.onmouseout = () => {
    downButton.style.backgroundColor = '#555';
  };

  // 将导航按钮添加到导航区域
  navigation.appendChild(upButton);
  navigation.appendChild(downButton);
  content.appendChild(navigation);

  // 将内容区域添加到悬浮框
  floatingBox.appendChild(content);

  // 将悬浮框添加到文档中
  document.body.appendChild(floatingBox);
}

function search(e: any) {
  const keyword = e.target.value;
  // 在下面这个map里面搜索出对应的keyword
  const results: HTMLElement[] = [];
  for (const key of textContentMap.keys()) {
    const value = textContentMap.get(key);
    if (keyword && value && value.includes(keyword)) {
      results.push(key);
    }
  }
  const positions = getTextPosition(keyword, results);
  renderTextHighlight(positions);
}

function getTextPosition(keyword: string, textNodes: HTMLElement[]) {
  const textPositions: {
    top: number;
    left: number;
    width: number;
    height: number;
  }[] = [];
  // 遍历父节点的所有子节点
  textNodes.forEach((textNode) => {
    const childNodes = textNode.childNodes;
    childNodes.forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        // 确保是文本节点
        const range = document.createRange();
        const text = childNode as Text;
        const startIndex = text.textContent?.indexOf(keyword) || 0;
        if (startIndex !== -1) {
          range.setStart(childNode, startIndex); // 从文本节点的开始位置
          range.setEnd(childNode, startIndex + keyword.length); // 到文本节点的结束位置
        } else {
          range.setStart(childNode, 0); // 从文本节点的开始位置
          range.setEnd(childNode, text.length); // 到文本节点的结束位置
        }

        // 获取范围的边界矩形
        const rect = range.getBoundingClientRect();
        textPositions.push({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
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
  const highlightContainer = document.querySelector('#highlight');
  highlightContainer?.remove();
  if (positions?.length === 0) return;
  const newHighlightContainer = document.createElement('div');
  newHighlightContainer.id = 'highlight';
  newHighlightContainer.style.position = 'fixed';
  newHighlightContainer.style.top = '0';
  newHighlightContainer.style.left = '0';
  newHighlightContainer.style.width = '100%';
  newHighlightContainer.style.height = '100%';
  newHighlightContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  newHighlightContainer.style.zIndex = '1000';
  newHighlightContainer.style.pointerEvents = 'none';
  document.body.appendChild(newHighlightContainer);

  positions.forEach((position) => {
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.top = `${position.top}px`;
    highlight.style.left = `${position.left}px`;
    highlight.style.width = `${position.width}px`;
    highlight.style.height = `${position.height}px`;
    highlight.style.backgroundColor = 'red';
    highlight.style.opacity = '0.5';
    newHighlightContainer.appendChild(highlight);
  });
}

window.addEventListener('load', () => {
  // getScrollableElements();
  setTimeout(() => {
    generateTextMap();
  }, 1000);
  insertInput();
});
