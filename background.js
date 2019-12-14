// chrome.contextMenus.removeAll();

// this works?
// chrome.contextMenus.create({
//       title: "first",
//       contexts: ["browser_action"],
//       onclick: function() {
//         alert('first');
//       }
// });
chrome.browserAction.onClicked.addListener(function() {
  chrome.storage.local.get(['disabled'], function(data) {
    if (data == undefined || chrome.runtime.lastError)
      data = { disabled: false };
    var new_state = !data.disabled;
    chrome.storage.local.set({
      disabled: new_state
    });
    chrome.browserAction.setTitle({ title: new_state ? 'Disabled' : 'Enabled' });
  })
});