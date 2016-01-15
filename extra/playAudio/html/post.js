function uploadFile(){
    var filepath = $("input[name='files']").val();
    var extStart = filepath.lastIndexOf(".");
    var ext = filepath.substring(extStart, filepath.length).toUpperCase();

    if (ext != ".WAV" && ext != ".MP3") {
        $("#spanMessage").html("限于wav,mp3格式");
        return false;
    }           

    var host = window.location.host;
    var web_url = 'http://'+host.replace(/1880/, "3000");
    var formData = new FormData($("#frmUploadFile")[0]);
    $.ajax({
        url: web_url+'/upload',
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data){
            if (200 === data.code) {
                $("#spanMessage").html("success");
            }
            else{
                $("#spanMessage").html("fail");
            }
      
        },
        error: function(){
            $("#spanMessage").html("error");
        }
    });
}