function obtainNicknames(callback) {
	chrome.storage.sync.get(["handleMap"], (our) => {
		if (our.handleMap == undefined) {
			chrome.storage.sync.set({ handleMap: {} }, () => obtainNicknames(callback));
			return;
		}
		callback(our.handleMap);
	});
}

// obtainNicknames(console.log);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.contentScriptQuery == "revealNames") {
		obtainNicknames(sendResponse);
		return true;
	}
});
