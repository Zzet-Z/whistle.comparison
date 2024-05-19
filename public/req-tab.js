;(function () {
  var diffResult = $('#diffResult tbody');
  diffResult.empty();
  var bodyResult = $('#bodyResult');

  var wb = window.whistleBridge;


  let firstClick = false
  let firstReqHeaderBody
  let firstReqHeaderQuery

  function parseSonJSON(obj) {
    for (let key in obj){
      if (typeof obj[key] === 'string') {
        try {
          // 使用JSON.parse()解析字符串
          obj[key] = JSON.parse(obj[key]);
        } catch (e) {
          // 如果解析失败，打印错误信息
          // console.error("Parsing error:", e);
        }
      }
    }
  }

  function compareAndDisplay(obj1, obj2, basePath) {
    var keysOnlyInJson1 = [];
    var keysOnlyInJson2 = [];
    var keysInBoth = [];

    for (var key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        if (obj2.hasOwnProperty(key)) {
          keysInBoth.push(key);
        } else {
          keysOnlyInJson1.push(key);
        }
      }
    }

    for (var key in obj2) {
      if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
        keysOnlyInJson2.push(key);
      }
    }

    // Display keys only in JSON1
    keysOnlyInJson1.forEach(function (key) {
      var path = basePath ? basePath + '.' + key : key;
      $('#diffResult tbody').prepend(
        '<tr class="key-only-in-json1">' +
        '<td>' + path + '</td>' +
        '<td>' + JSON.stringify(obj1[key]) + '</td>' +
        '<td>null</td>' +
        '</tr>'
      );
    });

    // Display keys only in JSON2
    keysOnlyInJson2.forEach(function (key) {
      var path = basePath ? basePath + '.' + key : key;
      $('#diffResult tbody').prepend(
        '<tr class="key-only-in-json2">' +
        '<td>' + path + '</td>' +
        '<td>null</td>' +
        '<td>' + JSON.stringify(obj2[key]) + '</td>' +
        '</tr>'
      );
    });

    // Display keys in both JSONs
    keysInBoth.forEach(function (key) {
      var path = basePath ? basePath + '.' + key : key;
      if (obj1[key] && typeof obj1[key] === 'object' && obj2[key] && typeof obj2[key] === 'object') {
        compareAndDisplay(obj1[key], obj2[key], path);
      } else {
        var isSame = JSON.stringify(obj1[key]) === JSON.stringify(obj2[key]);
        var value1Str = isSame ? obj1[key] : JSON.stringify(obj1[key]);
        var value2Str = isSame ? obj2[key] : JSON.stringify(obj2[key]);
        if (isSame) {
          $('#diffResult tbody').append(
            '<tr class="' + (isSame ? 'value-same' : 'key-diff') + '">' +
            '<td>' + path + '</td>' +
            '<td class="' + (isSame ? 'value-same' : 'value-diff') + '">' + value1Str + '</td>' +
            '<td class="' + (isSame ? 'value-same' : 'value-diff') + '">' + value2Str + '</td>' +
            '</tr>'
          );
        } else {
          $('#diffResult tbody').prepend(
            '<tr class="' + (isSame ? 'value-same' : 'key-diff') + '">' +
            '<td>' + path + '</td>' +
            '<td class="' + (isSame ? 'value-same' : 'value-diff') + '">' + value1Str + '</td>' +
            '<td class="' + (isSame ? 'value-same' : 'value-diff') + '">' + value2Str + '</td>' +
            '</tr>'
          );
        }
      }
    });
  }


  wb.addSessionRequestListener(function (item) {
    if (!item) {
      bodyResult.html('请选择请求')
      return;
    }

    if (!firstClick) {
      firstClick = true
      diffResult.empty();
      //记录第一个body参数
      // const mySymbol = Symbol.for("$body")
      // console.log("item==========>", item)
      // // console.log("第一次第一次", item.req[mySymbol])
      let reqBody1 = item.req.base64 ? atob(item.req.base64): ''
      try {
        firstReqHeaderBody = reqBody1 ? JSON.parse(reqBody1) : ''
      } catch (e) {
        // console.error(e)
        firstReqHeaderBody = ''
        try{
          const params = new URLSearchParams(reqBody1);
          firstReqHeaderBody = params ? Object.fromEntries(params) : '';
        }catch (e){
          // console.error(e)
          firstReqHeaderBody = ''
        }

      }

      //记录第一个query参数
      const urlObj = new URL(item.url);
      // 使用URLSearchParams对象来解析查询参数
      const searchParams = new URLSearchParams(urlObj.search);
      // 将查询参数转换为对象
      firstReqHeaderQuery = searchParams ? Object.fromEntries(searchParams) : '';

      // // console.log("item========>",item)
      // // console.log("click========>",firstClick)
      // // console.log("reqHB========>",firstReqHeaderBody)
      // // console.log("reqHQ========>",firstReqHeaderQuery)
      bodyResult.html('请选择第二个请求')

    } else {
      //todo 展示对比
      let secondReqHeaderBody
      let secondReqHeaderQuery
      diffResult.empty();
      //记录第二个body参数
      // const mySymbol2 = Symbol.for("$body")
      // // console.log("第一次第一次", item.req[mySymbol2])
      let reqBody2 = item.req.base64 ? atob(item.req.base64): ''
      try {
        secondReqHeaderBody = reqBody2 ? JSON.parse(reqBody2) : ''
        // console.log("try到这2body",item)
      } catch (e) {
        // console.error(e)
        secondReqHeaderBody = ''
        try{
          const params = new URLSearchParams(reqBody2);
          secondReqHeaderBody = params ? Object.fromEntries(params) : '';
          // console.log("second=======>", secondReqHeaderBody)
        }catch (e){
          // console.error(e)
          secondReqHeaderBody = ''
        }
      }

      //记录第二个query参数
      const urlObj = new URL(item.url);
      // 使用URLSearchParams对象来解析查询参数
      const searchParams = new URLSearchParams(urlObj.search);
      // 将查询参数转换为对象
      secondReqHeaderQuery = searchParams ? Object.fromEntries(searchParams) : '';

      firstClick = false
      bodyResult.html('对比入参')
      // console.log("type=======>",typeof (firstReqHeaderBody))
      // console.log("type2=======>",typeof (secondReqHeaderBody))
      // console.log("length=========>", Object.keys(secondReqHeaderQuery))
      let firstReqHeaderBodyLength = firstReqHeaderBody ? Object.keys(firstReqHeaderBody).length : 0
      let firstReqHeaderQueryLength = firstReqHeaderQuery ? Object.keys(firstReqHeaderQuery).length : 0
      let secondReqHeaderBodyLength = secondReqHeaderBody ? Object.keys(secondReqHeaderBody).length : 0
      let secondReqHeaderQueryLength = secondReqHeaderQuery ? Object.keys(secondReqHeaderQuery).length : 0
      // console.log("firstReqHeaderQueryLength========>",firstReqHeaderQueryLength)
      let obj1
      let obj2
      if (firstReqHeaderBodyLength > firstReqHeaderQueryLength){
        obj1 = firstReqHeaderBody
      }else{
        obj1 = firstReqHeaderQuery
      }
      if (secondReqHeaderBodyLength > secondReqHeaderQueryLength){
        obj2 = secondReqHeaderBody
      }else{
        obj2 = secondReqHeaderQuery
      }
      // console.log("obj1========>",obj1)
      // console.log("obj2========>",obj2)
      try {
        parseSonJSON(obj1)
        parseSonJSON(obj2)
      }catch (e) {
        console.error(e)
      }

      // console.log("obj1========>",obj1)
      compareAndDisplay(obj1, obj2, '')

      // if (typeof (firstReqHeaderBody) === 'object' && typeof (secondReqHeaderBody) === 'object') {
      //   compareAndDisplay(firstReqHeaderBody, secondReqHeaderBody, '')
      //   // console.log("走到body里了")
      // } else {
      //   compareAndDisplay(firstReqHeaderQuery, secondReqHeaderQuery, '')
      //   // console.log("走到query里了")
      // }
      // 测试用例
      // var json1 = '{"name": "Jane", "age": 30, "address": {"city": "San Francisco", "zip": "10001"}}';
      // var json2 = '{"name": "Jane", "age1": 25, "address": {"city": "San Francisco", "zip": "94101", "extra": "detail"}}';
      // var obj1 = JSON.parse(json1);
      // var obj2 = JSON.parse(json2);
      // compareAndDisplay(obj1,obj2,'')
    }
  });
})();
