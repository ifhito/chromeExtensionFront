/*browser.runtime.onMessage.addListener(async (request) => {
  console.log(request);
  return { response: 'ok' };
});*/

// import { response } from 'express';

// window.addEventListener('load', (event) => {
//     chrome.tabs.executeScript(null, {
//       file: 'js/content.js', //my content script   }, () => {
//         connect() //this is where I call my function to establish a connection     });
//     });
//   });

// function connect() {
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const port = chrome.tabs.connect(tabs[0].id);
//     port.postMessage({ function: 'html' });
//     port.onMessage.addListener((response) => {
//     html = response.html;
//     title = response.title;
//     description = response.description;
//     });
// });
// }
let URL = '';
let userId = '';
let nowUrl = '';
chrome.identity.getProfileUserInfo((userInfo) => {
  userId = userInfo.id;
  // const node = document.createElement('LI'); // Create a <li> node
  // const textnode = document.createTextNode(userId); // Create a text node
  // node.appendChild(textnode); // Append the text to <li>
  // document.getElementById('displayContent').appendChild(node);
  console.log(userId);
});

document.getElementById('chengeAllFlagButton').onclick = async () => {
  const data = {
    change: 'change_false_all',
  };
  await fetch('http://0.0.0.0:5000/changeFlag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
};

document.getElementById('moveOptionPage').onclick = () => {
  chrome.tabs.create({
    active: true,
    url: 'chrome-extension://hpofogcbfiekphfhomfolgcnmoepagde/options.html',
  });
};
const makeDom = (commits, idName) => {
  for (const num in commits.entries) {
    if (nowUrl != commits.entries[num].url) {
      //後にホームページのタイトルにする
      const url = document.createElement('div');
      url.innerHTML = commits.entries[num].pageTitle;
      document.getElementById(idName).appendChild(url);
      nowUrl = commits.entries[num].url;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    const node = document.createElement('div'); // Create a <li> node
    node.id = commits.entries[num].nowTime;
    node.className = 'linkBox';
    const childNode = document.createElement('span');
    const childButtonNode = document.createElement('button');
    const childChangeFlagButtonNode = document.createElement('button');
    childButtonNode.value = nowUrl;
    childChangeFlagButtonNode.value = nowUrl;
    node.onclick = () => {
      chrome.tabs.create({
        active: true,
        url: commits.entries[num].url,
      });
    };
    childButtonNode.onclick = async () => {
      let data = {
        userId: userId,
        url: childButtonNode.value.toString(),
        time: node.id.toString(),
      };
      await fetch('http://0.0.0.0:5000/deleteData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(data),
      });
    };
    childChangeFlagButtonNode.onclick = async () => {
      let data = {
        change: 'change_false',
        userId: userId,
        url: childChangeFlagButtonNode.value.toString(),
        time: node.id.toString(),
      };
      await fetch('http://0.0.0.0:5000/changeFlag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(data),
      });
    };
    // childNode.href =
    //   commits1.entries[num].url + '#' + commits1.entries[num].nowTime;
    const textnode = document.createTextNode(commits.entries[num].selectText); // Create a text node
    childButtonNode.innerHTML = '×';
    childChangeFlagButtonNode.innerHTML = 'changePast';
    childNode.appendChild(textnode);
    node.appendChild(childNode);
    wrapper.appendChild(node);
    wrapper.appendChild(childButtonNode);
    wrapper.appendChild(childChangeFlagButtonNode);
    document.getElementById(idName).appendChild(wrapper);
    nowUrl = commits.entries[num].url;
  }
};

// const deleteData = () => {

// }
chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tab) => {
  // 現在のタブを取得
  URL = String(tab[0].url);
  // const node = document.createElement('LI'); // Create a <li> node
  // const textnode = document.createTextNode(URL); // Create a text node
  // node.appendChild(textnode); // Append the text to <li>
  // document.getElementById('displayContent').appendChild(node);

  let data = {
    userId: userId,
    url: URL,
  };
  //後にまとめた方が良いか
  console.log(JSON.stringify(data));
  let response1 = await fetch('http://0.0.0.0:5000/getPositiveData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  let response2 = await fetch('http://0.0.0.0:5000/getNegativeData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  console.log(response1, response2);
  // let response = await fetch('http://0.0.0.0:5000/getData');
  let commits1 = await response1.json(); // レスポンスの本文を読み JSON としてパースする
  let commits2 = await response2.json();
  console.log(commits1.entries.length);
  if (commits1.entries.length != 0) {
    makeDom(commits1, 'displayPosiContent');
  }
  console.log(commits2.entries.length);
  if (commits2.entries.length != 0) {
    makeDom(commits2, 'displayNegaContent');
  }
  console.log(`URL: ${URL}`);
});

// document.addEventListener('DOMContentLoaded', function () {
//   var links = document.getElementsByTagName('a');
//   for (var i = 0; i < links.length; i++) {
//     (function () {
//       var ln = links[i];
//       var location = ln.href;
//       ln.onclick = function () {
//         chrome.tabs.create({ active: true, url: location });
//       };
//     })();
//   }
// });

// window.onload = async () => {
//   let data = {
//     userId: userId,
//     url: URL,
//   };
//   console.log(JSON.stringify(data));
//   let response = await fetch('http://0.0.0.0:5000/getData', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=utf-8',
//     },
//     body: JSON.stringify(data),
//   });
//   console.log(response);
//   // let response = await fetch('http://0.0.0.0:5000/getData');
//   let commits = await response.json(); // レスポンスの本文を読み JSON としてパースする
//   console.log(commits.entries.length);
//   if (commits.entries.length != 0) {
//     for (const num in commits.entries) {
//       const node = document.createElement('LI'); // Create a <li> node
//       const textnode = document.createTextNode(commits.entries[num].selectText); // Create a text node
//       node.appendChild(textnode); // Append the text to <li>
//       document.getElementById('displayContent').appendChild(node);
//     }
//   }
//   console.log(commits);
// };
