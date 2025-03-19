window.addEventListener('load', () => {
  /*------------------------------------------------*/
  // ウィンドウの設定
  /*------------------------------------------------*/

  // ウィンドウのサイズを変更
  window.resizeTo(1200, 800);

  /*------------------------------------------------*/
  // 要素の取得
  /*------------------------------------------------*/

  // コメントテーブル
  const commentTable = document.querySelector('.comment-form-container table');
  // 一番目の列
  const firstColumnCells = commentTable.querySelectorAll('td:nth-child(1), th:nth-child(1)');
  // 二番目の列
  const secondColumnCells = commentTable.querySelectorAll('td:nth-child(2), th:nth-child(2)');
  // 一番目の行
  const firstRow = commentTable.querySelectorAll('tr')[0];
  // 二番目の行
  const secondRow = commentTable.querySelectorAll('tr')[1];
  // 三番目の行
  const thirdRow = commentTable.querySelectorAll('tr')[2];
  // コメントボックス
  const CommentBox = commentTable.querySelector('textarea');

  /*------------------------------------------------*/
  // 既存のスタイルの変更
  /*------------------------------------------------*/

  // コメントテーブルの高さを100vhに設定
  if (commentTable) {
    commentTable.style.height = '100vh';
  }
  // 一番目の列の幅を設定
  firstColumnCells.forEach(cell => {
    cell.style.width = '100px';
  });
  // 二番目の列の幅を設定
  secondColumnCells.forEach(cell => {
    cell.style.width = '50%';
  });
  // 一番目の行の高さを設定
  firstRow.style.height = '50px';
  // 二番目の行の高さを設定
  thirdRow.style.height = '70px';

  // コメントボックスを非表示に
  if (CommentBox) {
    CommentBox.style.display = 'none';
  }

  /*------------------------------------------------*/
  // 新しいコメントボックスを挿入
  /*------------------------------------------------*/
  const newCommentBox = document.createElement('textarea');
  newCommentBox.style.height = '100%';
  newCommentBox.style.width = '100%';
  secondColumnCells[1].appendChild(newCommentBox);

  newCommentBox.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault(); // デフォルトのTabキーによるカーソル移動を防ぐ

      const cursorPosition = newCommentBox.selectionStart;
      const textBefore = newCommentBox.value.substring(0, cursorPosition);
      const textAfter = newCommentBox.value.substring(cursorPosition);

      // インデントとして4つのスペースを挿入
      newCommentBox.value = textBefore + '    ' + textAfter;

      // カーソルをインデント後に移動
      newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + 4;

      // 入力イベントを発火させてプレビューを更新
      newCommentBox.dispatchEvent(new Event('input'));
    }
  });

  /*------------------------------------------------*/
  // コメントプレビューを挿入
  /*------------------------------------------------*/

  // 新しいセルを作成
  const thirdcolumn = document.createElement('td');
  // セルを2行目に追加
  secondRow.appendChild(thirdcolumn);
  // プレビュー用のiframeを作成
  const previewBox = document.createElement('iframe');
  previewBox.id = 'preview';
  previewBox.style.border = '1px solid #ccc';
  previewBox.style.height = '100%';
  previewBox.style.width = '100%';
  previewBox.style.background = '#fff'; // 背景を白に設定

  thirdcolumn.appendChild(previewBox);

  /*------------------------------------------------*/
  // プレビューレンダリング処理
  /*------------------------------------------------*/

  newCommentBox.addEventListener('input', () => {
    let content = newCommentBox.value;
    let previewDoc = previewBox.contentDocument || previewBox.contentWindow.document;
    previewDoc.open();
    previewDoc.write(`
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
        </style>
      </head>
      <body>
        ${marked.parse(content)}
      </body>
    </html>
    `);
    previewDoc.close();
    // CommentBoxにHTMLとしてコピー
    if (CommentBox) {
      let parsedContent = marked.parse(content);
      // <pre></pre>タグを削除
      parsedContent = parsedContent.replace(/<pre[^>]*>|<\/pre>/g, '');
      parsedContent = '</p>' + parsedContent + '<p>';
      console.log(parsedContent);
      CommentBox.value = parsedContent;
    }
  });


  /*------------------------------------------------*/
  // ボタンの挿入
  /*------------------------------------------------*/

  // 新しい行を一番目の下に追加
  const newRow = commentTable.insertRow(1); // 1番目の位置（1行目の下）に新しい行を追加
  newRow.style.height = '50px';
  // 新しい行にセルを追加
  const newCell1 = newRow.insertCell(0);
  const newCell2 = newRow.insertCell(1);
  const newCell3 = newRow.insertCell(2);

  // セルにテキストを追加
  const label = document.createElement('label');
  label.setAttribute('for', 'body');
  label.textContent = 'プレビュー';

  // 新しいセルにラベルで囲まれたテキストを追加
  newCell3.appendChild(label);

  // 見出し1ボタンを作成
  const h1Button = document.createElement('button');
  h1Button.textContent = '見出し1';
  h1Button.style.margin = '2px';
  h1Button.type = 'button';
  newCell2.appendChild(h1Button);

  // 見出し2ボタンを作成
  const h2Button = document.createElement('button');
  h2Button.textContent = '見出し2';
  h2Button.style.margin = '2px';
  h2Button.type = 'button';
  newCell2.appendChild(h2Button);

  // 見出し3ボタンを作成
  const h3Button = document.createElement('button');
  h3Button.textContent = '見出し3';
  h3Button.style.margin = '2px';
  h3Button.type = 'button';
  newCell2.appendChild(h3Button);

  // 強調ボタンを作成
  const boldButton = document.createElement('button');
  boldButton.textContent = '強調';
  boldButton.style.margin = '2px';
  boldButton.type = 'button';
  newCell2.appendChild(boldButton);

  // リンク挿入ボタンを作成
  const linkButton = document.createElement('button');
  linkButton.textContent = 'リンク';
  linkButton.style.margin = '2px';
  linkButton.type = 'button';
  newCell2.appendChild(linkButton);

  // 画像挿入ボタンを作成
  const imageButton = document.createElement('button');
  imageButton.textContent = '画像';
  imageButton.style.margin = '2px';
  imageButton.type = 'button';
  newCell2.appendChild(imageButton);

  // テーブル挿入ボタンを作成
  const tableButton = document.createElement('button');
  tableButton.textContent = '表';
  tableButton.style.margin = '2px';
  tableButton.type = 'button';
  newCell2.appendChild(tableButton);

  // コード挿入ボタンを作成
  const codeButton = document.createElement('button');
  codeButton.textContent = 'コード';
  codeButton.style.margin = '2px';
  codeButton.type = 'button';
  newCell2.appendChild(codeButton);

  /*------------------------------------------------*/
  // 見出し挿入処理
  /*------------------------------------------------*/

  h1Button.addEventListener('click', (event) => {
    event.preventDefault();
    const h1Tag = '# 見出し1\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + h1Tag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + h1Tag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  h2Button.addEventListener('click', (event) => {
    event.preventDefault();
    const h2Tag = '## 見出し2\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + h2Tag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + h2Tag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  h3Button.addEventListener('click', (event) => {
    event.preventDefault();
    const h3Tag = '### 見出し3\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + h3Tag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + h3Tag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  /*------------------------------------------------*/
  // 強調挿入処理
  /*------------------------------------------------*/

  boldButton.addEventListener('click', (event) => {
    event.preventDefault();
    const boldTag = '**強調**\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + boldTag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + boldTag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  /*------------------------------------------------*/
  // リンク挿入処理
  /*------------------------------------------------*/

  linkButton.addEventListener('click', (event) => {
    event.preventDefault();
    const linkTag = '[リンクテキスト](#)\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + linkTag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + linkTag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  /*------------------------------------------------*/
  // 画像挿入処理
  /*------------------------------------------------*/

  imageButton.addEventListener('click', (event) => {
    event.preventDefault();
    const imgTag = '![代替テキスト](画像のURL "画像タイトル")\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + imgTag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + imgTag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });


  /*------------------------------------------------*/
  // テーブル挿入処理
  /*------------------------------------------------*/

  tableButton.addEventListener('click', (event) => {
    event.preventDefault();
    const tableHTML = '| Left align | Right align | Center align |\n|:-----------|------------:|:------------:|\n| This       | This        | This         |\n| column     | column      | column       |\n| will       | will        | will         |\n| be         | be          | be           |\n| left       | right       | center       |\n| aligned    | aligned     | aligned      |\n';

    // テキストボックスに挿入
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + tableHTML + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + tableHTML.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });

  /*------------------------------------------------*/
  // コード挿入処理
  /*------------------------------------------------*/

  codeButton.addEventListener('click', (event) => {
    event.preventDefault();
    const codeTag = '```c\n#include <stdio.h>\nvoid main() {\n  printf("Hello World");\n}\n```\n';
    const cursorPosition = newCommentBox.selectionStart;
    const textBefore = newCommentBox.value.substring(0, cursorPosition);
    const textAfter = newCommentBox.value.substring(cursorPosition);
    newCommentBox.value = textBefore + codeTag + textAfter;
    newCommentBox.selectionStart = newCommentBox.selectionEnd = cursorPosition + codeTag.length;
    newCommentBox.dispatchEvent(new Event('input'));
  });
});


/*------------------------------------------------*/
// コメントの送信処理
/*------------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('comment-form');
  const newCommentBox = document.getElementById('body');

  // 隠しフィールドを作成
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'parsed_body';
  commentForm.appendChild(hiddenInput);

  // フォーム送信時の処理
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault(); // デフォルトの送信を防ぐ

    // textareaの内容をHTMLに変換
    const parsedContent = marked.parse(newCommentBox.value);

    // 隠しフィールドにHTMLをセット
    hiddenInput.value = parsedContent;

    // フォーム送信
    commentForm.submit();
  });
});
