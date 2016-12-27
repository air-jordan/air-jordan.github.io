var VUE;
$(function(){
    $.getJSON("https://spreadsheets.google.com/feeds/list/1pOlPpmQkwQhXSFMDx6wryFhvQL8tjf1gbbiJQLRvDPs/1/public/values?alt=json",function(DB){
        var sneakers = _.map(DB.feed.entry,function(data){
            var o = {};
            // 1차정제(스프레드시트 데이터)
            for(key in data){
                if(key.indexOf("gsx$")!= -1){
                    var nkey = key.split("gsx$")[1];
                    o[nkey] = data[key].$t;
                }
            }
            return o;
        });

        var getSortSelectData = [];
        var getSortDateData = [];
        _.each(sneakers,function(item){
            item.month = (item.year+"").substring(4,6);
            item.year = (item.year+"").substring(0,4);
            item.type="kor";
            item.show="show";
            item.imagetype = "origin";
            item.originimage = item.image;
            item.sideimage="s_"+item.image;
            item.specimage="p_"+item.image;
            getSortSelectData.push(item.no);
            getSortDateData.push(item.year+"."+item.month);
        });
        getSortSelectData = _.uniq(getSortSelectData);
        getSortDateData = _.uniq(getSortDateData);
        VUE = new Vue({
            el: '#sneaker',
            ready:function(){
                $("#sneakerList img").one("error",function(){
                    $(this).attr("src","/sneaker/images/common/404.jpg");
                });
                $("#sneakerList img").each(function(){
                    var src = $(this).attr("data-src");
                    $(this).attr("src",src);
                });
                _.each( getSortSelectData.sort(function(a,b){if(a=="other"){a=99;};return a-b}) ,function(brandno){
                    $("#sortBtn").append("<li><button onclick=\"VUE.update('brand','"+brandno+"')\">jordan "+brandno+"</button></li>");
                });
                _.each( getSortDateData.sort() ,function(date){
                    $("#sortDateBtn").append("<li><button onclick=\"VUE.update('date','"+date+"')\">"+date+"</button></li>");
                });
            },
            data: {
                sneakers: sneakers // _.shuffle(sneakers)
            },
            methods:{
                lang:function(index,lang){
                    this.sneakers[index].type=lang;
                },
                allLang:function(lang){
                    _.each(this.sneakers,function(item){
                        item.type = lang;
                    });
                },
                originImage:function(){
                    _.each(this.sneakers,function(item){
                        item.image = item.originimage;
                        item.imagetype = "origin";
                    });
                    setTimeout(function(){
                        $("#sneakerList img").each(function(){
                            var src = $(this).attr("data-src");
                            $(this).attr("src",src);
                        });
                    },10);
                },
                sideImage:function(){
                    _.each(this.sneakers,function(item){
                        item.image = item.sideimage;
                        item.imagetype = "side";
                    });
                    setTimeout(function(){
                        $("#sneakerList img").each(function(){
                            var src = $(this).attr("data-src");
                            console.log(src);
                            $(this).attr("src",src);
                        });
                    },10);
                },
                update:function(type,num){
                    // var num = $("#updateNumber").val();
                    if(type=="brand"){
                        _.each(this.sneakers,function(item,index){
                            var brandno = item.no;
                            if(brandno!=num){
                                item.show = "";
                            }else{
                                item.show = "show";
                            }
                        });
                    };
                    if(type=="date"){
                        _.each(this.sneakers,function(item,index){
                            var date = item.year+"."+item.month;
                            if(date!=num){
                                item.show = "";
                            }else{
                                item.show = "show";
                            }
                        });
                    };
                },
                viewAll:function(){
                    _.each(this.sneakers,function(item,index){
                        item.show = "O";
                    });
                }
            }
        });
    });
});



/*
 var data = [
 {name:"jordan1"},
 {name:"jordan2"},
 {name:"kyrie"}
 ];
 class SneakerItem{
 constructor(sneaker){
 this.sneaker = sneaker;
 }
 log(){
 console.log(this.sneaker.name);
 return "asd";
 }
 };

 var SneakerItemList = (function(list){
 _.each(data,function(item){
 list.push(new SneakerItem(item));
 });
 return list;
 })([]);

 _.each(SneakerItemList,function(sneaker){
 VUE = new Vue({
 el: '#sneaker-rack',
 data: {
 sneakers: _.shuffle( sneakers ) // _.shuffle()
 }
 });
 });
 */


