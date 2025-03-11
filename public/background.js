chrome.action.onClicked.addListener((tab) => {
  console.log('图标被点击，尝试打开侧边栏。');
  chrome.sidePanel.open({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
    tabId: tab.id,
  });
});
