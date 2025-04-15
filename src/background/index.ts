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
