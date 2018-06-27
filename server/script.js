$(".prow").click(function(){
    var pid = $(this).find(">:first-child").html();
    window.location = "?kill=" + pid;
});