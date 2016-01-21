
function getQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
function uploadFile(){
    var filepath = $("input[name='files']").val();
    var extStart = filepath.lastIndexOf(".");
    var ext = filepath.substring(extStart, filepath.length).toLowerCase();

    if (getQueryString('type') == 'picture'){
        if (ext != ".jpeg" && ext != ".jpg" && ext != ".png" && ext != ".bmp") {
            $("#spanMessage").html("限于png,jpg,jpeg,bmp格式");
            return false;
        }
    }
    else if (getQueryString('type') == 'audio'){
        if (ext != ".wav" && ext != ".mp3") {
            $("#spanMessage").html("限于wav,mp3格式");
            return false;
        } 
    }
    else{
        return false;
    }

    var host = window.location.host;
    var web_url = 'http://'+host.replace(/1880/, "3000");
    var formData = new FormData($("#frmUploadFile")[0]);
    $.ajax({
        url: web_url+'/upload?type='+getQueryString('type'),
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        beforeSend: function(XMLHttpRequest){
            $("#spanMessage").html('uploading...');
        },
        success: function(data){
            if (200 === data.code) {
                $("#spanMessage").html("success");
            }
            else{
                $("#spanMessage").html("fail");
            }
      
        },
        complete: function(XMLHttpRequest, textStatus){
            //$("#spanMessage").html('complete');
        },
        error: function(){
            $("#spanMessage").html("error");
        }
    });
}