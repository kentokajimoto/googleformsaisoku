//催促メールを送る関数
function sendsaisoku(link, recipientEmail,name) {
  var subject = "未回答のグーグルフォームがあります（自動送信）"; // メールの件名を指定
  var body = name+" 様\n\n" +
             "未回答のグーグルフォームがあります。\n" +
             "締め切りまで時間はありますが、早めのご回答をお願いいたします。\n\n" +
             "以下フォームのリンクです:\n" +
             link + "\n\n" +
             "所属団体名"; // メールの本文を指定

  // メールを送信
  GmailApp.sendEmail(recipientEmail, subject, body);
}

// 会員全員の二次元配列を作る
function getkaiin() {
  var spreadsheetURL = "https://docs.google.com/spreadsheets/d/1yVz4JAEbmoFqDDe37zEvXqXEotEvSxoWOfR6m6Ixme0/edit#gid=0";
  
  // スプレッドシートを開く
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetURL);
  
  // シートを選択（シート名を指定する場合は、getSheetByNameを使用）
  var sheet = spreadsheet.getSheets()[0]; // 1つ目のシートを選択

  // A2から最後の行までのデータを取得
  var dataRange = sheet.getRange("A2:B" + sheet.getLastRow());
  var values = dataRange.getValues();

  // データを二次元配列に入れる
  var data = [];

  for (var i = 0; i < values.length; i++) {
    var rowData = values[i];
    data.push(rowData);
  }

  // データをログに出力（テスト用）
  Logger.log(data);
  return data;
}


//回答者の配列を作る
function getFormanswer(formUrl) {
  // フォームのIDを抽出
  var formId = getFormIdFromUrl(formUrl);
  
  //回答者を保存する配列
  let kaitousya=[];

  if (formId) {
    // フォームの詳細情報を取得
    var form = FormApp.openById(formId);
    
    //全回答の取得
    var formResponses = form.getResponses();

    for (var i = 0; i < formResponses.length; i++)  {
      //0番目の質問のi番目の回答をゲット
      var itemResponses = formResponses[i].getItemResponses();
      var response = itemResponses[0].getResponse();
      kaitousya[i]=response;
      //Logger.log(response);
    }
  }
  
  for(var i=0;i<formResponses.length;i++){
    Logger.log(kaitousya[i]);
  }
  return kaitousya;
}

//フォームのurlからフォームIDを出力
function getFormIdFromUrl(url) {
  // URLからフォームのIDを抽出
  var matches = /\/d\/([a-zA-Z0-9-_]+)/.exec(url);
  if (matches && matches.length > 1) {
    return matches[1];
  } else {
    return null;
  }
}

//回答者と会員を比較して未解答者にメール指示を出す
function comparemember(kaiin, answer,link){
  Logger.log("compare");
  for(var i=0;i<kaiin.length;i++){
    Logger.log("kaiin"+kaiin[i][0]);
    flag=0;
    for(var j=0;j<answer.length;j++){
      Logger.log("answer"+answer[j]);
      if(kaiin[i][0]==answer[j]){
        Logger.log("ちゃんと回答しています。")
        flag=1;//回答者がいれば
      }
    }
    if(flag==0){
      sendsaisoku(link,kaiin[i][1],kaiin[i][0]);
      Logger.log("send"+kaiin[i][0])      
    }

  }
}

//main関数
function myFunction() {
  Logger.log("プログラムが起動しました")
  // スプレッドシートのURL
  var spreadsheetURL = "https://docs.google.com/spreadsheets/d/1_TFydhDYs58cB5eePO8gtEMPrPf3GkdPv3mEeQmu9JU/edit#gid=0";

  // スプレッドシートを開く
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetURL);
  
  // シートを選択（シート名を指定する場合は、getSheetByNameを使用）
  var sheet = spreadsheet.getSheets()[0];
  
  for (var i = 2; i <= 50; i++) { // E2からE50までのセルをループ
    var cell = sheet.getRange("E" +i).getValue(); // Eiセルの値を取得
    var cellValue = Utilities.formatDate(cell, "GMT", "yyyy/MM/dd"); // 日付をyyyy/MM/dd形式にフォーマット
    
    var today = new Date(); // 本日の日付を取得
    var dateValue = Utilities.formatDate(today, "GMT", "yyyy/MM/dd"); // 日付をyyyy/MM/dd形式にフォーマット

    //Logger.log(cellValue);
    //Logger.log(dateValue);
    
    if (cellValue === dateValue) {
      // D2セルの値と本日の日付が一致した場合に実行する処理をここに記述
      // 例えば、メッセージをログに記録する場合
      Logger.log("D"+i+"セルの値と本日の日付が一致しました。");
      var link = sheet.getRange("B" +i).getValue(); // Biセルの値を取得
      var answer=getFormanswer(link);
      var kaiin= getkaiin();
      comparemember(kaiin,answer,link);
      // ここで他の処理を実行できます。
    }
  }

}


