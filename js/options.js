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

const makeDom = (commits, idName) => {
  if (nowUrl != commits.url) {
    //後にホームページのタイトルにする
    const url = document.createElement('div');
    url.innerHTML = commits.pageTitle;
    document.getElementById(idName).appendChild(url);
    nowUrl = commits.url;
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  const node = document.createElement('div'); // Create a <li> node
  node.id = commits.nowTime;
  node.className = 'linkBox';
  const childNode = document.createElement('span');
  const childButtonNode = document.createElement('button');
  const childChangeFlagButtonNode = document.createElement('button');
  childButtonNode.value = nowUrl;
  childChangeFlagButtonNode.value = nowUrl;
  node.onclick = () => {
    chrome.tabs.create({
      active: true,
      url: commits.url,
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
      change:
        idName == 'displayCurrentContent' ? 'change_false' : 'change_true',
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
  const textnode = document.createTextNode(commits.selectText); // Create a text node
  childButtonNode.innerHTML = '×';
  childChangeFlagButtonNode.innerHTML =
    idName == 'displayCurrentContent' ? 'changePast' : 'changeCurrent';
  childNode.appendChild(textnode);
  node.appendChild(childNode);
  wrapper.appendChild(node);
  wrapper.appendChild(childButtonNode);
  wrapper.appendChild(childChangeFlagButtonNode);
  document.getElementById(idName).appendChild(wrapper);
  nowUrl = commits.url;
};

// const deleteData = () => {

// }
chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tab) => {
  // const node = document.createElement('LI'); // Create a <li> node
  // const textnode = document.createTextNode(URL); // Create a text node
  // node.appendChild(textnode); // Append the text to <li>
  // document.getElementById('displayContent').appendChild(node);

  let data = {
    userId: userId,
  };
  //後にまとめた方が良いか
  console.log(JSON.stringify(data));
  let response = await fetch('http://0.0.0.0:5000/getAllData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  console.log(response);
  // let response = await fetch('http://0.0.0.0:5000/getData');
  let commits = await response.json(); // レスポンスの本文を読み JSON としてパースする
  for (const num in commits.entries) {
    if (commits.entries[num].flag == true) {
      makeDom(commits.entries[num], 'displayCurrentContent');
    } else {
      makeDom(commits.entries[num], 'displayPastContent');
    }
  }
  //   if (commits1.entries.length != 0) {
  //     makeDom(commits1, 'displayPosiContent');
  //   }
  //   console.log(commits2.entries.length);
  //   if (commits2.entries.length != 0) {
  //     makeDom(commits2, 'displayNegaContent');
  //   }
});
