let markdownMode = true;

let commentTable, commentBox;
let firstRow, secondRow, thirdRow;
let firstcol;
let newTextarea, previewBox, previewTd, toolbarRow;

/*------------------------------------------------*/
// 初期化
/*------------------------------------------------*/
window.addEventListener('load', () => {
  chrome.storage.local.get("isMarkdownModeEnabled", function (value) {
    markdownMode = value.isMarkdownModeEnabled ?? true;
    console.log('Markdown mode:', markdownMode);

    resizeWindow();
    getDOMElements();
    if (!commentTable) return;
    applyCommentTableStyles();
    createToggleButton();
  });
});

/*------------------------------------------------*/
// ウィンドウサイズ調整
/*------------------------------------------------*/
function resizeWindow() {
  window.resizeTo(1200, 800);
}

/*------------------------------------------------*/
// 要素取得
/*------------------------------------------------*/
function getDOMElements() {
  commentTable = document.querySelector('.comment-form-container table');
  if (!commentTable) return;
  commentBox = commentTable.querySelector('textarea');
  [firstRow, secondRow, thirdRow] = commentTable.querySelectorAll('tr');
  firstcol = firstRow.querySelector('th');
}

/*------------------------------------------------*/
// コメントテーブルのスタイル設定
/*------------------------------------------------*/
function applyCommentTableStyles() {
  setStyle(commentTable, { height: '100vh' });
  setStyle(firstRow, { height: '50px' });
  setStyle(thirdRow, { height: '70px' });
  setStyle(commentBox, { height: '100%', width: '100%' });
  setStyle(firstcol, { width: '100px' });
}

function setStyle(element, styleObj) {
  Object.assign(element.style, styleObj);
}

/*------------------------------------------------*/
// トグルボタンの作成
/*------------------------------------------------*/
function createToggleButton() {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '0.4em';
  wrapper.style.marginLeft = '3.5em';

  const toggle = document.createElement('label');
  toggle.className = 'toggle-button';
  toggle.innerHTML = '<input type="checkbox"/>';

  const labelText = document.createElement('span');
  labelText.textContent = 'マークダウンモード';

  wrapper.appendChild(toggle);
  wrapper.appendChild(labelText);
  firstRow.cells[1].appendChild(wrapper);

  const checkbox = toggle.querySelector('input');
  checkbox.checked = markdownMode;

  if (markdownMode) {
    enableMarkdownUI();
  }

  checkbox.addEventListener('change', () => {
    markdownMode = checkbox.checked;
    chrome.storage.local.set({ 'isMarkdownModeEnabled': markdownMode }, () => {
      console.log('Markdown mode:', markdownMode);
    });
    console.log('Markdown mode:', markdownMode);
    if (markdownMode) {
      enableMarkdownUI();
    } else {
      disableMarkdownUI();
    }
  });
}


const style = document.createElement('style');
style.textContent = `
.toggle-button {
  display: flex;
  align-items: center;
  position: relative;
  width: 60px;
  height: 15px;
  border-radius: 50px;
  background-color: #dddddd;
  cursor: pointer;
  transition: background-color .4s;
}
.toggle-button:has(:checked) {
  background-color: #4bd865;
}
.toggle-button::after {
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 0 5px rgb(0 0 0 / 20%);
  background: #fff;
  content: '';
  transition: left .4s;
}
.toggle-button:has(:checked)::after {
  left: 30px;
}
.toggle-button input {
  display: none;
}`;
document.head.appendChild(style);

/*------------------------------------------------*/
// Markdown UI の有効化
/*------------------------------------------------*/
function enableMarkdownUI() {
  commentBox.style.display = 'none';

  newTextarea = createTextArea();
  secondRow.cells[1].appendChild(newTextarea);
  newTextarea.addEventListener('keydown', handleTabKey);
  newTextarea.addEventListener('input', () => updatePreview(newTextarea, previewBox));

  previewBox = createPreviewBox();
  previewTd = document.createElement('td');
  previewTd.appendChild(previewBox);
  secondRow.appendChild(previewTd);

  initMarkdownToolbar(commentTable, newTextarea);
}

/*------------------------------------------------*/
// Markdown UI の無効化
/*------------------------------------------------*/
function disableMarkdownUI() {
  commentBox.style.display = '';

  if (newTextarea && newTextarea.parentNode) {
    newTextarea.parentNode.removeChild(newTextarea);
  }

  if (previewBox && previewBox.parentNode) {
    previewBox.parentNode.removeChild(previewBox);
  }

  if (previewTd && previewTd.parentNode) {
    previewTd.parentNode.removeChild(previewTd);
    previewTd = null;
  }

  if (toolbarRow && toolbarRow.parentNode) {
    toolbarRow.parentNode.removeChild(toolbarRow);
    toolbarRow = null;
  }
}

/*------------------------------------------------*/
// テキストエリア・プレビュー作成
/*------------------------------------------------*/
function createTextArea() {
  const textarea = document.createElement('textarea');
  setStyle(textarea, { height: '100%', width: '100%' });
  textarea.id = 'body';
  return textarea;
}

function createPreviewBox() {
  return Object.assign(document.createElement('iframe'), {
    id: 'preview',
    style: 'border: 1px solid #ccc; height: 100%; width: 100%; background: #fff;'
  });
}

/*------------------------------------------------*/
// プレビュー更新
/*------------------------------------------------*/
function updatePreview(textarea, previewBox) {
  const content = textarea.value;
  const parsed = marked.parse(content);
  const previewDoc = previewBox.contentDocument || previewBox.contentWindow.document;

  previewDoc.open();
  previewDoc.write(`
    <html>
      <head><style>body { font-family: Arial, sans-serif; padding: 10px; }</style></head>
      <body>${parsed}</body>
    </html>
  `);
  previewDoc.close();

  if (commentBox) {
    commentBox.value = '</p>' + parsed.replace(/<pre[^>]*>|<\/pre>/g, '') + '<p>';
  }
}

/*------------------------------------------------*/
// Tabキーでスペースを挿入
/*------------------------------------------------*/
function handleTabKey(event) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const textarea = event.target;
    const pos = textarea.selectionStart;
    textarea.value = textarea.value.slice(0, pos) + '    ' + textarea.value.slice(pos);
    textarea.selectionStart = textarea.selectionEnd = pos + 4;
    textarea.dispatchEvent(new Event('input'));
  }
}

/*------------------------------------------------*/
// マークダウンツールバー
/*------------------------------------------------*/
function initMarkdownToolbar(table, textarea) {
  toolbarRow = table.insertRow(1);
  toolbarRow.style.height = '50px';
  const [_, buttonCell, labelCell] = [...Array(3)].map(() => toolbarRow.insertCell());

  const label = document.createElement('label');
  label.textContent = 'プレビュー';
  label.htmlFor = 'body';
  labelCell.appendChild(label);

  const buttons = [
    { text: '見出し1', tag: '# 見出し1\n' },
    { text: '見出し2', tag: '## 見出し2\n' },
    { text: '見出し3', tag: '### 見出し3\n' },
    { text: '強調', tag: '**強調**\n' },
    { text: 'リンク', tag: '[リンクテキスト](#)\n' },
    { text: '画像', tag: '![代替テキスト](画像のURL "画像タイトル")\n' },
    { text: '表', tag: '| Left | Right | Center |\n|:---|---:|:---:|\n| A | B | C |\n' },
    { text: 'コード', tag: '```c\n#include <stdio.h>\nvoid main() {\n  printf("Hello World");\n}\n```\n' }
  ];

  buttons.forEach(({ text, tag }) => {
    const btn = document.createElement('button');
    Object.assign(btn, { textContent: text, type: 'button' });
    btn.style.margin = '2px';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { selectionStart, value } = textarea;
      textarea.value = value.slice(0, selectionStart) + tag + value.slice(selectionStart);
      textarea.selectionStart = textarea.selectionEnd = selectionStart + tag.length;
      textarea.dispatchEvent(new Event('input'));
    });
    buttonCell.appendChild(btn);
  });
}

/*------------------------------------------------*/
// Markdown変換して隠しフィールドに格納
/*------------------------------------------------*/
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('comment-form');
  if (!form) return;

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'parsed_body';
  form.appendChild(hiddenInput);

  form.addEventListener('submit', (e) => {
    if (!markdownMode) return;
    e.preventDefault();
    if (newTextarea) {
      hiddenInput.value = marked.parse(newTextarea.value);
      form.submit();
    }
  });
});
