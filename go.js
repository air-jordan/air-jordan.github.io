var fs = require('fs');
var _ = require("underscore");
var request = require("request");
var url = "https://spreadsheets.google.com/feeds/list/1pOlPpmQkwQhXSFMDx6wryFhvQL8tjf1gbbiJQLRvDPs/1/public/values?alt=json"
// var url = "./temp.json";
    request({
        url: url,
        json: true
    }, function (error, response, DB) {
        console.log(error);
        if (!error && response.statusCode === 200) {
            // console.log(DB) // Print the json response

            var all = _.map(DB.feed.entry,function(data){
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

            var sneakers = _.filter(all,function(sneaker){
                return (sneaker.view != "");
            });

            var getSortSelectData =[]; // 브랜드 정보만
            _.each(sneakers,function(item){
                getSortSelectData.push(item.no);
            });
            getSortSelectData = _.uniq(getSortSelectData);

            // 스니커 페이지 생성
            _.each(sneakers,function(sneaker){
                // 아카이브 생성
                try{
                    fs.mkdirSync('sneakers/'+sneaker.brand+''+sneaker.no);
                }catch(e){
                    if ( e.code != 'EEXIST' ) throw e;
                }
                fs.writeFileSync('sneakers/'+sneaker.brand+''+sneaker.no+'/'+sneaker.style+'-'+sneaker.code+'.html', makeTistoryHtml(sneaker));
                console.log(sneaker.style+"-"+sneaker.code+" file created.");

                // 릴리즈 생성
                try{
                    fs.mkdirSync('release/'+sneaker.brand+''+sneaker.no);
                }catch(e){
                    if ( e.code != 'EEXIST' ) throw e;
                }
                if(sneaker.enrelease){
                    fs.writeFileSync('release/'+sneaker.brand+''+sneaker.no+'/en_'+sneaker.style+'-'+sneaker.code+'.html', makeReleaseHtml(sneaker,"en"));
                };
                if(sneaker.korelease){
                    fs.writeFileSync('release/'+sneaker.brand+''+sneaker.no+'/ko_'+sneaker.style+'-'+sneaker.code+'.html', makeReleaseHtml(sneaker,"ko"));
                };
            });
        }
    });


// 발매일정(릴리즈) 만들기
function makeReleaseHtml(sneaker,lang){
    var str = '';
    str += '<p style="text-align: center; clear: none; float: none;">'+sneaker[lang+"release"]+'</p><p><br /></p>';
    str += '<div class="description"><p>'+sneaker[lang+"desc1"]+'</p>'+((sneaker[lang+"desc2"]) ? '<p>'+sneaker[lang+"desc2"]+'</p>' : '')+'</div>';
    str += '<div class="spec-info"> <div class="spec-dl"> <h3>'+sneaker[lang+"name"]+' "'+sneaker[lang+"nick"]+'"</h3>';
    str += '<dl class="info-color"><dt>Style</dt><dd>'+sneaker.style+'-'+sneaker.code+'</dd></dl>';
    str += '<dl class="info-color"><dt>Color</dt><dd>'+sneaker[lang+"color"]+'</dd></dl>';
    str += '<dl class="info-date"><dt>Release Date</dt><dd>'+sneaker[lang+"date"]+'</dd></dl>';
    if(lang=="en"){
        str += '<dl class="info-price"><dt>Price</dt><dd>$'+sneaker.enprice+'</dd></dl>';
    }else{
        str += '<dl class="info-price"><dt>Price</dt><dd>'+sneaker.koprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'원</dd>';
    };
    str += '</div></div>';
    str += '<div class="source-info">Via. <a href="'+sneaker[lang+"link"]+'" target="_blank">'+((lang=="en") ? "nike.com" : "nike.co.kr")+'</a></div>';
    return str;
};

// 스니커 아카이브 파일 만들기
function makeTistoryHtml(sneaker){
    var desc = (sneaker.kodesc1) ? sneaker.kodesc1 : sneaker.endesc1;
    var str = '<div class="tts">'+sneaker.enname+' "'+sneaker.ennick+'" | '+desc+'|||</div>';
    str += '<div class="sneakerContent">';
    str += '<div class="leftSec"><div class="sideShot">';
    if(sneaker.tistoryimage!=""){
        str += sneaker.tistoryimage;
    }else{
        str += '이미지';
    };
    str += '</div><div class="image-source">image-source : <a href="http://www.nike.com" target="_blank">Nike.com</a></div></div>';
    str += '<div class="rightSec">';
    str += '<div class="spec-info"> <div class="spec-dl"> <h3>'+sneaker.enname+' "'+sneaker.ennick+'"</h3>';
    str += '<dl class="info-color"><dt>Style</dt><dd>'+sneaker.style+'-'+sneaker.code+'</dd></dl>';
    str += '<dl class="info-color"><dt>Color</dt><dd>'+sneaker.encolor+'</dd>'+( (sneaker.kocolor!="" && sneaker.kocolor!="미발매") ? '<dd>'+sneaker.kocolor+'</dd>':'')+'</dl>';
    str += '<dl class="info-date"><dt>Release Date</dt><dd>'+sneaker.endate+'</dd>'+( (sneaker.kodate!="" && sneaker.kodate!="미발매") ? '<dd>'+sneaker.kodate+'</dd>':'')+'</dl>';
    str += '<dl class="info-price"><dt>Price</dt><dd>$'+sneaker.enprice+'</dd>'+( (sneaker.koprice) ? '<dd>'+sneaker.koprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'원</dd>':'')+'</dl>';
    str += '</div></div>';
    str += '</div>';
    str += '<div class="image-more"><button type="button" onclick="loadimg(\''+sneaker.style+'\',\''+sneaker.code+'\');"><i class="fa fa-sort-desc" aria-hidden="true"></i><span>Images More</span></button><div id="oimg"></div></div>';
    if(desc!=""){
        str += '<div class="description"><p>'+sneaker.kodesc1+'</p>'+((sneaker.kodesc2) ? '<p>'+sneaker.kodesc2+'</p>' : '')+'</div>';
        str += '<div class="description"><p>'+sneaker.endesc1+'</p>'+((sneaker.endesc2) ? '<p>'+sneaker.endesc2+'</p>' : '')+'</div>';
    };
    str += '<div class="source-info">Via. '+((sneaker.enlink) ? '<a href="'+sneaker.enlink+'" target="_blank">nike.com</a>' : '')+' '+((sneaker.kolink) ? '<a href="'+sneaker.kolink+'" target="_blank">nike.co.kr</a>' : '')+'</div>';
    str += '<div class="market-info"><div class="market-dl"><h3>Market Place(link)</h3>';
    str += '<dl><dt>Nike Inc.</dt><dd>';
    str += '<a href="http://store.nike.com/us/en_us/pw/n/1j7?sl='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="나이키 미국사이트로 연결">nike.com</a>';
    str += ', <a href="http://www.nike.co.kr/search/showSearch.lecs?research='+sneaker.style+'" target="_blank" title="나이키 한국사이트로 연결">nike.co.kr</a>';
    str += '</dd></dl>';
    str += '<dl><dt>Select Shop(en)</dt><dd>';
    str += '<a href="http://www.footlocker.com/_-_/keyword-'+sneaker.enname+' '+sneaker.style+' '+sneaker.code+'" target="_blank" title="풋락커 미국사이트로 연결">footlocker</a>';
    str += ', <a href="http://www.eastbay.com/_-_/keyword-'+sneaker.enname+' '+sneaker.style+' '+sneaker.code+'" target="_blank" title="이스트베이 미국사이트로 연결">eastbay</a>';
    str += ', <a href="http://www.finishline.com/store/_/N-/Ntt-'+sneaker.style+'-'+sneaker.code+'" target="_blank" title="피니쉬라인 미국사이트로 연결">finishline</a>';
    str += ', <a href="http://www.sneakersnstuff.com/en/search/searchbytext?key='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="스니커앤스터프 미국사이트로 연결">sneakersnstuff</a>';
    str += ', <a href="http://www.endclothing.com/us/catalogsearch/result/?q='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="앤드클로징 미국사이트로 연결">endclothing</a>';
    str += ', <a href="https://www.ruvilla.com/catalogsearch/result/?q='+sneaker.style+'-'+sneaker.code+'" target="_blank">ruvilla</a>';
    str += '</dd></dl>';
    str += '<dl><dt>Select Shop(ko)</dt><dd>';
    str += '<a href="http://footsell.co.kr/product/search.html?banner_action=&keyword='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="풋셀스토어 사이트로 연결">풋셀스토어</a>';
    str += ', <a href="http://hoopcity.co.kr/shop/goods/goods_search.php?searched=Y&log=1&skey=all&hid_pr_text=&hid_link_url=&edit=&sword='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="훕시티 사이트로 연결">훕시티온라인</a>';
    str += ', <a href="http://www.player.co.kr/v3/search/search.php?q='+sneaker.style+'" target="_blank" title="플레이어 사이트로 연결">플레이어</a>';
    str += ', <a href="http://www.popo-mall.com/shop/goods/goods_search.php?searched=Y&skey=all&sword='+sneaker.style+'" target="_blank" target="_blank" title="포포몰 사이트로 연결">포포몰</a>';
    str += '</dd></dl>';
    str += '<dl><dt>Search Engine</dt><dd>';
    str += '<a href="http://shopping.naver.com/search/all.nhn?query='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="네이버지식쇼핑 사이트로 연결">네이버 지식쇼핑</a>';
    str += ', <a href="http://www.enuri.com/search.jsp?keyword='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="에누리 가격비교 사이트로 연결">에누리 가격비교</a>';
    str += ', <a href="http://search.danawa.com/dsearch.php?k1='+sneaker.style+'-'+sneaker.code+'" target="_blank" title="다나와 가격비교 사이트로 연결">다나와 가격비교</a>';
    str += '</dd></dl>';
    str += '</div></div>';
    str += '</div>';

    return str;
};