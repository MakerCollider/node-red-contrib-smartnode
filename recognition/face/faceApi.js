exports.getFaceInfo = function getFaceInfo(imgFile,callBackFace)  {
    var https = require('https');
	var querystring=require('querystring');

    //request param
	var contents = querystring.stringify({
		    returnFaceId: 'false',
        returnFaceLandmarks: 'false',
        returnFaceAttributes: 'age,gender,smile,facialHair,glasses'
	});

	var options = {
		    host:'westus.api.cognitive.microsoft.com',
        //port:'443',
		    path:'/face/v1.0/detect?' + contents,
		    method:'POST',
		    headers:{
                'Content-Type':'application/json',
                'Ocp-Apim-Subscription-Key':'22da5511726f443fbdac6af7eb95c7bf'
       }
	};


	var req = https.request(options,function(res) {
        //console.log('STATUS:' + res.statusCode + '\n');
        //console.log('HEADERS:' + JSON.stringify(res.headers) + '\n');
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var say = '人脸识别： ';
            //alert(JSON.stringify(data[0].faceAttributes));
            var data = JSON.parse(chunk);
            if(data = null)
            if (JSON.stringify(data[0].faceAttributes.gender) == '"male"') {
                say += '男 ';
            } else {
                say += '女 ';
            }
            say += parseFloat(JSON.stringify(data[0].faceAttributes.age)).toFixed(0) + '岁 ';
            if (JSON.stringify(data[0].faceAttributes.smile) > 0.0) {
                say += '微笑 ' ;
            }
            if (JSON.stringify(data[0].faceAttributes.facialHair) && JSON.stringify(data[0].faceAttributes.facialHair.moustache) > 0.2) {
                say += '上嘴唇有胡须 ' ;
            }
            if (JSON.stringify(data[0].faceAttributes.facialHair) && JSON.stringify(data[0].faceAttributes.facialHair.beard) > 0.2) {
                say += '下巴有胡须 ' ;
            }
            if (JSON.stringify(data[0].faceAttributes.facialHair) && JSON.stringify(data[0].faceAttributes.facialHair.sideburns) > 0.2) {
                say += '有些络腮胡 ' ;
            }
            if (JSON.stringify(data[0].faceAttributes.glasses).toLowerCase() == '"sunglasses"') {
                say += '戴墨镜' ;
            }
            else if (JSON.stringify(data[0].faceAttributes.glasses).toLowerCase() == '"readingglasses"') {
                say += '戴眼镜 ' ;
            }
            else if (JSON.stringify(data[0].faceAttributes.glasses).toLowerCase() == '"swimminggoggles"') {
                say += '戴泳镜 ' ;
            } else {
                say += '不戴眼镜 '
            }
            callBackFace(say);
            //console.log(say);
        });

        res.on('end',function() {
            //console.log('END');
        });

        req.on('error',function(e){
            console.log(e.message);
        });
    });

  //request body
  var body = {"url":"http://114.215.132.162:3002/"+imgFile};
  var bodyString = JSON.stringify(body);

  req.write(bodyString);
  req.end();

}
