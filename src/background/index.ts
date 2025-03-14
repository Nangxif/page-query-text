/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    chrome.sidePanel.open({
      tabId: sender?.tab?.id!,
      windowId: sender?.tab?.windowId!,
    });
    sendResponse({ status: 'success' });
  }
});
