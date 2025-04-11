/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    chrome.sidePanel.open({
      tabId: sender?.tab?.id!,
      windowId: sender?.tab?.windowId!,
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
