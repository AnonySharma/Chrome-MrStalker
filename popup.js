var isListOpen = false;
var nicknames = undefined;

// replace handle with nickname
function revealNames(handleMap) {
	var links = document.getElementsByTagName("a");
	var users = [];
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		var href = link.getAttribute("href");
		if (href.indexOf("/profile/") == 0) {
			users.push(link);
		}
	}

	console.log(handleMap);
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		if (handleMap[user.innerText] != undefined) {
			user.textContent += " (" + handleMap[user.textContent] + ")";
		}
	}
}

// gets handle from the chrome local storage
async function getNicknames() {
	await chrome.storage.sync.get(["handleMap"], function (result) {
		var handleMap = result.handleMap;
		if (handleMap == undefined) {
			handleMap = {};
		}
		nicknames = handleMap;
	});
}

chrome.runtime.sendMessage({ contentScriptQuery: "revealNames" }, (text) => {
	revealNames(text);
});

// saves handles and nicknames in the chrome local storage
function saveToHandleMap(handle, nickname) {
	chrome.storage.sync.get(["handleMap"], function (result) {
		var handleMap = result.handleMap;
		if (handleMap == undefined) {
			handleMap = {};
		}
		handleMap[handle] = nickname;
		chrome.storage.sync.set({ handleMap: handleMap });
	});
}

document.addEventListener("DOMContentLoaded", async () => {
	await getNicknames();
	document.getElementById("saveToHandleMap").addEventListener("click", () => {
		saveToHandleMap(document.getElementById("handle").value, document.getElementById("nickname").value);
	});

	document.getElementById("clearHandleMap").addEventListener("click", () => {
		chrome.storage.sync.set({ handleMap: {} });
	});

	var buttons = document.getElementsByClassName("toggleList");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", function () {
			var home = document.getElementById("home");
			var list = document.getElementById("listNames");
			isListOpen = !isListOpen;
			if (isListOpen) {
				var tableRows = document.getElementsByTagName("tbody")[0];
				if (nicknames.length == 0) {
					var table = document.createElement("table");
					table.style.display = "none";
					list.innerHTML = "No nicknames";
				} else if (tableRows.childElementCount == 0) {
					for (var handle in nicknames) {
						var row = document.createElement("tr");
						var cell1 = document.createElement("td");
						var cell2 = document.createElement("td");

						var link = document.createElement("a");
						link.href = "https://www.codeforces.com/profile/" + handle;
						link.target = "_blank";
						link.style.cursor = "pointer";
						link.appendChild(document.createTextNode(handle));

						cell1.appendChild(link);
						cell2.appendChild(document.createTextNode(nicknames[handle]));
						row.appendChild(cell1);
						row.appendChild(cell2);
						tableRows.appendChild(row);
					}
				}
				home.style.display = "none";
				list.style.display = "block";
			} else {
				home.style.display = "block";
				list.style.display = "none";
			}
		});
	}

	document.getElementById("go-to-options").addEventListener("click", function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL("options.html"));
		}
	});
});
