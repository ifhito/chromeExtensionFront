let HASH = '';
let URL = '';
let userId = '';
chrome.runtime.onInstalled.addListener(function () {
  chrome.identity.getProfileUserInfo((userInfo) => {
    userId = userInfo.id;
    console.log(userId);
  });
  chrome.contextMenus.create({
    title: '選択中の文字列をコピー',
    type: 'normal',
    contexts: ['selection'],
    id: 'post',
  });
});

chrome.tabs.onUpdated.addListener(async function (tabId, info, tab) {
  if (info.status === 'complete') {
    // URL = await toString(tab.url);
    console.log(userId);
    console.log(tab.url);
    let data = {
      userId: userId,
      url: tab.url,
    };
    console.log(JSON.stringify(data));
    let response = await fetch('http://0.0.0.0:5000/getData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    console.log(response);
    // let response = await fetch('http://0.0.0.0:5000/getData');
    let commits = await response.json(); // レスポンスの本文を読み JSON としてパースする
    console.log(commits.entries.length);
    if (commits.entries.length != 0) {
      chrome.tabs.sendMessage(tabId, { text: commits }, (response) => {
        if (chrome.runtime.lastError) {
          setTimeout(ping, 1000);
        } else {
          console.log(response);
        }
      });
    }
    if (tab.url.includes('https://duckduckgo.com/')) {
      chrome.tabs.sendMessage(tabId, { text: 'test' }, async (response) => {
        console.log(response);
        let n = 0;
        for (res of response) {
          console.log(res);
          let data = {
            urls: res,
            userId: userId,
          };
          let response2 = await fetch('http://0.0.0.0:5000/scrapingData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(data),
          });
          let commits = await response2.json();
          const sentence = commits.sentence;
          if (sentence == 'error') {
            n++;
            continue;
          }
          if (sentence.length != 0) {
            chrome.tabs.sendMessage(
              tabId,
              { text: 'displayAbstract', sentence: sentence, num: n },
              (response) => {
                if (chrome.runtime.lastError) {
                  setTimeout(ping, 1000);
                } else {
                  console.log(response);
                }
              }
            );
          }
          n++;
          console.log(commits.sentence);
        }
      });
    }
    console.log(commits);
    // URL = tab.url;
    // chrome.storage.local.get(URL, async function (items) {
    //   const strings = await items[URL];
    //   console.log(URL);
    //   console.log(items);
    //   console.log(strings);
    //   if (strings != null) {
    //     chrome.tabs.sendMessage(tabId, { text: strings }, (response) => {
    //       console.log(response);
    //     });
    //     console.log(items);
    //   }
    // });
  }
});
// 拡張機能がインストールされたときの処理
// chrome.runtime.onInstalled.addListener(function () {
//   //コンテクストメニュー　右クリック時に出る表示のやつ

// });
chrome.contextMenus.onClicked.addListener(function (item) {
  console.log('メニューがクリックされたよ');
  if (item.menuItemId == 'post') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      URL = String(tabs[0].url);
      pageTitle = String(tabs[0].title);
      // const encoder = new TextEncoder();
      // const data = encoder.encode(URL);
      // const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      // const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      // HASH = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      chrome.tabs.sendMessage(tabs[0].id, { text: 'code-block' }, saveText);
    });
  } else if (item.menuItemId == 'get') {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        URL = String(tabs[0].url);
        // const encoder = new TextEncoder();
        // const data = encoder.encode(URL);
        // const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        // const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        // HASH = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        chrome.storage.local.get(URL, function (items) {
          const value = items[URL];
          console.log(URL);
          console.log(value);
          console.log(items);
        });
      }
    );
  }
  // 選ばれたメニューのidが item.menuItemId で取得できる
  // chrome.tabs.executeScript({
  //   code: "document.body.style.backgroundColor = '" + item.menuItemId + "'"
  // });
});
// chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tab) => {
//   // 現在のタブを取得
//   URL = String(tab[0].url); // tab.titleには現在開いているタブのページタイトルが、tab.urlにはURLが格納されている。
//   console.log(`URL: ${URL}`);
// });
async function saveText(sendedData) {
  if (chrome.runtime.lastError) {
    setTimeout(saveText, 1000);
  } else {
    // const sendData = {
    //   selectText: selectText,
    //   nowTime: nowTime,
    //   tagName: tagName,
    //   parentElementText: parentElementText,
    // };
    let data = {
      userId: userId,
      url: URL,
      pageTitle: pageTitle,
      parentDom: sendedData.parentDom,
      nowTime: sendedData.nowTime,
      selectText: sendedData.selectText,
      // tagName: sendedData.tagName,
    };

    let response = await fetch('http://0.0.0.0:5000/push_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    const content = await response.json();
    console.log(URL);
    console.log(content);
    // console.log('select', DomText);

    // chrome.storage.local.set({
    //   [URL]: DomText,
    // });
    // console.log('I received the following DOM content:\n' + DomText);
  }
}

// //選択中の文字列を取得する関数
// function copytext(info) {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     URL = String(tabs[0].url);
//     console.log(tabs[0].url);
//     chrome.tabs.sendMessage(tabs[0].id, { text: 'code-block' }, saveText);
//   });
//   // chrome.tabs.query({ active: true }, (tab) => {
//   //   // 現在のタブを取得
//   //   URL = String(tab[0].url); // tab.titleには現在開いているタブのページタイトルが、tab.urlにはURLが格納されている。
//   //   // chrome.tabs.sendMessage(tab[0].id, { text: 'code-block' }, doStuffWithDom);
//   //   console.log(`URL: ${URL}`);
//   // });
//   // let selection_text = window.getSelection().toString();
//   // console.log('text', URL);
//   // chrome.storage.local.set({
//   //   [URL]: selection_text,
//   // });
//   // console.log(selection_text); //取得した文字列をデバッグに送る
// }

function getText(info, tab) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tab) => {
    // 現在のタブを取得
    URL = String(tab[0].url); // tab.titleには現在開いているタブのページタイトルが、tab.urlにはURLが格納されている。
    console.log(`URL: ${URL}`);
  });
  let url = URL;
  console.log(url);
  chrome.storage.local.get(url, function (items) {
    console.log(items); // -> "string1"
  });
  // chrome.tabs.query(
  //   { active: true, currentWindow: true, lastFocusedWindow: true },
  //   function (tabs) {
  //     let url = tabs.url;
  //     console.log('met', url);
  //     chrome.storage.local.get(url, function (items) {
  //       console.log(items.url); // -> "string1"
  //     });
  //   }
  // );
}
// const onInit = (event) => {
//   // First copy simple
//   let el2 = document.getElementById('to-newline');
//   console.log(el2);
//   el2.addEventListener('click', getText);
// };
// document.addEventListener('DOMContentLoaded', onInit, false);
//選択中文字列をクリップボードに入れる
// saveToClipboard = (str) => {
//   var textArea = document.createElement('textarea');
//   chrome.storage.sync.set({
//     value1: 'string1',
//     value2: 'string2',
//   });
//   document.body.appendChild(textArea);
//   textArea.value = str;
//   textArea.select();
//   document.execCommand('copy');
//   document.body.removeChild(textArea);
// };
