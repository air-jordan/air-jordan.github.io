$(function(){
    $("#sneakerList img").one("error",function(){
        $(this).attr("src","images/common/404.jpg");
    });
    $("#sneakerList img").each(function(){
        var src = $(this).attr("data-src");
        $(this).attr("src",src);
    });

    $( "#sneakerSearch" ).load( "./searchDOM.html", function( response, status, xhr ) {
        if ( status == "error" ) {
            $("#sneakerSearch").load("../brand/searchDOM.html");
        };
    });
});

function view(){
    $("#sneaker,#sneakerContent").toggleClass("over");

}

function loadimg(style,num){
    var style = style+"";
    var num = num;
    function appendImg(alp){
        var url = "http://images.nike.com/is/image/DotCom/PDP_HERO/-"+style+"_"+num+"_"+alp+"_PREM.jpg?wid=500&hei=500&fmt=jpg&qlt=50";
        $("#oimg").append("<img src='"+url+"' />");
    };
    $("#oimg").show();
    appendImg("A");
    appendImg("B");
    appendImg("C");
    appendImg("D");
    appendImg("E");
    appendImg("F");
};