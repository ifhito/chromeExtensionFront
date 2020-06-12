const highlight = (nowTime, parentElementText, selectText, tagName) => {
  // const nowTime = request.text.entries[content].nowTime;
  // const parentElementText = request.text.entries[content].parentElementText;
  // const selectText = request.text.entries[content].selectText;
  // const tagName = request.text.entries[content].tagName;
  let elements = document.querySelectorAll(tagName);
  elements.forEach(async (element) => {
    console.log(element.textContent);
    if (element.textContent == parentElementText) {
      let contentText = element.innerHTML;
      let chengeText =
        '<span style="background:yellow" ' +
        'id="' +
        nowTime +
        '">' +
        selectText +
        '</span>';
      contentText = contentText.replace(selectText, chengeText);
      element.innerHTML = contentText;
      console.log(element.innerHTML);
    }
  });
};
// document.onselectionchange = () => {
//   const range = window.getSelection().getRangeAt(0);
//   const clone = range.cloneRange();
//   const fixedPosition = range.endOffset;
//   // 末尾の文字列を選択した時はダミーテキストを追加して選択範囲を拡大する
//   if (fixedPosition + 1 > range.endContainer.length) {
//     const dummy = document.createTextNode('&#8203;');
//     clone.insertNode(dummy);
//     clone.selectNode(dummy);
//     const rect = clone.getBoundingClientRect();
//     const doms = document.createElement('div');
//     doms.style = `left:${rect.left}px; top:${rect.top}px; height:20px; width: 60px;`;
//     doms.innerHTML = 'highlight';
//     document.body.appendChild(doms);
//     console.log(rect.top, rect.left);
//     dummy.parentNode.removeChild(dummy);
//   } else {
//     clone.setStart(range.endContainer, fixedPosition);
//     clone.setEnd(range.endContainer, fixedPosition + 1);
//     const rect = clone.getBoundingClientRect();
//     const doms = document.getElementById('highlight-tool')
//     doms.style = `left:${rect.left}px; top:${rect.top}px; height:20px; width: 60px;`;
//     doms.innerHTML = 'highlight';
//     console.log(rect.top, rect.left);
//   }
//   clone.detach();
// };
// window.onload = () => {
//   const doms = document.createElement('div');
//   doms.id = 'highlight-tool';
//   document.body.appendChild(doms);
// };
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.text == 'code-block') {
    const selection = window.getSelection();
    const selectText = selection.toString();
    const range = selection.getRangeAt(0);
    // const tagName = range.commonAncestorContainer.parentElement.tagName;
    // const parentElementText = range.commonAncestorContainer.textContent;
    const date = new Date();
    const nowTime = Math.floor(date.getTime() / 1000);
    // let parentElement = range.parentElement.innerHTML;
    // highlight(nowTime, parentElementText, selectText, tagName);
    const newNode = document.createElement('span');
    newNode.id = nowTime.toString();
    newNode.className = 'myExtentionHighlight';
    newNode.innerHTML = selection.toString();
    range.deleteContents(); // 範囲選択箇所を一旦削除
    range.insertNode(newNode); // 範囲選択箇所の先頭から、修飾したspanを挿入
    //ここの部分でエラーが出ている。まず、ハイライトではない方がいいか？←解決済み
    let parentDom = window.getSelection().getRangeAt(0).commonAncestorContainer
      .outerHTML;
    const sendData = {
      selectText: selectText,
      nowTime: nowTime,
      parentDom: parentDom,
      // parentElementText: parentElementText,
      // tagName: tagName,
    };

    // const div = document.createElement('div');
    // div.style.display = 'none';
    // div.innerHTML = test;
    // let dom_text = div;
    // console.log('test', test);
    sendResponse(sendData);
  } else {
    console.log(request.text);
    // for (const content in request.text.entries) {
    //   const nowTime = request.text.entries[content].nowTime;
    //   const parentElementText = request.text.entries[content].parentElementText;
    //   const selectText = request.text.entries[content].selectText;
    //   const tagName = request.text.entries[content].tagName;
    //   let elements = document.querySelectorAll(child_node.tagName);
    //   elements.forEach(async (element) => {
    //     if (element.textContent == parentElementText && element.tagName == tagName) {

    //       element.innerHTML = child_node.innerHTML;
    //       console.log(element.innerHTML);
    //     }
    //   });

    // }

    const div = document.createElement('div');
    div.style.display = 'none';
    // console.log(request.text[0]);
    for (const num in request.text.entries) {
      // highlight(
      //   request.text.entries.nowTime,
      //   request.text.entries.parentElementText,
      //   request.text.entries.selectText,
      //   request.text.entries.tagName
      // );
      div.innerHTML = request.text.entries[num].parentDom;
      console.log(div.innerHTML);
      let child_node = div.firstElementChild;
      console.log('ch_node', child_node);
      let dom_text = div.textContent;
      let elements = document.querySelectorAll(child_node.tagName);
      elements.forEach(async (element) => {
        if (element.textContent == dom_text) {
          element.innerHTML = child_node.innerHTML;
          console.log(element.innerHTML);
        }
      });
      if (request.text.entries[num].flag == '0') {
        const element = document.getElementById(
          request.text.entries[num].nowTime
        );
        console.log(element);
        element.className = 'myExtentionHighlightPast';
      }
    }
    sendResponse('ok');
  }
});

// var match = element.textContent.match(str);
// match.style.backgroundColor = '#FF00FF';
// element.innerHTML.replace(
//   str,
//   '<span style="background:yellow">${str}</span>'
// );

// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     if (msg.function == 'html') {
//       port.postMessage({
//         html: document.documentElement.outerHTML,
//         description: document
//           .querySelector("meta[name='description']")
//           .getAttribute('content'),
//         title: document.title,
//       });
//     }
//   });
// });
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(request.text);
//   if (request.text == 'code-block') {
//     console.log('true');
//     const selection = document.all[0].outerhtml;
//     sendResponse(selection);
//   }
//   return true;
// });
