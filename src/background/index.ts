/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSettingSidePanel') {
    chrome.sidePanel.setOptions({
      enabled: true,
      tabId: sender?.tab?.id!,
      path: 'Sidebar.html', // 你的侧边栏HTML文件路径
    });
    chrome.sidePanel.open({
      tabId: sender?.tab?.id!,
    });
    sendResponse({ status: 'success' });
  }

  if (request.action === 'openSummaryResultListSidePanel') {
    chrome.sidePanel.setOptions({
      enabled: true,
      tabId: sender?.tab?.id!,
      path: 'SummaryResultList.html', // 你的侧边栏HTML文件路径
    });
    // 然后打开侧边栏
    chrome.sidePanel.open({
      tabId: sender?.tab?.id!,
    });
    sendResponse({ status: 'success' });
  }

  if (request.action === 'openTab') {
    chrome.tabs.create({ url: chrome.runtime.getURL(request.data.url) });
    sendResponse({ status: 'success' });
  }

  if (request.action === 'insertSearchBox') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id!, { action: 'insertSearchBox' });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // 创建一个简单的菜单项
  console.log('onInstalled');
  chrome.contextMenus.create({
    id: 'summarySelection',
    title: '总结选中的文本',
    contexts: ['selection'], // 只在有文本被选中时显示
  });
});

// 添加菜单点击事件监听器
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarySelection' && info.selectionText) {
    console.log('选中的文本:', info.selectionText);
    // 这里可以处理选中的文本，例如发送消息到内容脚本
    chrome.tabs.sendMessage(tab?.id!, {
      action: 'summarySelection',
      data: {
        selectionText: info.selectionText,
      },
    });
  }
});
