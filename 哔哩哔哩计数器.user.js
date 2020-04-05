// ==UserScript==
// @name         哔哩哔哩计数器
// @namespace    https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @version      2.0.0
// @updateURL    https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @downloadURL  https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @description  显示哔哩哔哩上传视频数的实际计数
// @author       lxfly2000
// @match        *://*.bilibili.com/
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    addEventListener("load",bilibiliCounter);//等页面加载完后再执行否则会被覆盖
})();

var tagListItem={};//分区名（网页上）——DOM节点
var tagNameTable={};//tid与分区名（ZoneConfig定义）转换表

function bilibiliCounter(){
    getHomeLink();
}

function getHomeLink(){
    var xhr=new XMLHttpRequest();
    xhr.open("GET","//www.bilibili.com/index.html",true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&&xhr.status==200){
            var homelink="";
            //2020-4-5：首页被替换为新版主页
            var homereg=new RegExp("//s[0-9]\\.hdslb\\.com/bfs/static/jinkela/international-home/international-home\\.?[^\\.]+\\.js");
            var regMatch=xhr.responseText.match(homereg);
            if(regMatch==null){
                console.log("无法找到对应的脚本URL。");
            }else{
                homelink=regMatch[0];
            }
            getTagList(homelink);
        }
    };
    xhr.send(null);
}

function getTagList(homelink){
    if(homelink==""){
        console.log("未找到链接。");
        return;
    }
    //xhr用法参考：https://github.com/lxfly2000/AnimeSchedule/blob/master/app/src/main/res/raw/main.js
    var xhr=new XMLHttpRequest();
    xhr.open("GET",homelink,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&&xhr.status==200){
            buildTagList(xhr.responseText);
        }
    };
    xhr.send(null);
}

function buildTagList(src_text){
    tagNameTable={};
    var dicMatch=src_text.match(/\{[^{}]*name: *"[^"]*",[^{}]*tid: *\d+/g);
    for(var i=0;i<dicMatch.length;){
        var name=dicMatch[i].match(/name: *"([^"]*)"/)[1];
        var tid=dicMatch[i].match(/tid: *(\d+)/)[1];
        if(tagNameTable[tid]==undefined||tagNameTable[tid]==null){
            tagNameTable[tid]=new Set([name]);
        }else{
            tagNameTable[tid].add(name);//注意tid要转换成字符串
        }
        i++;
    }

    var xhr=new XMLHttpRequest();
    xhr.open("GET","https://api.bilibili.com/x/web-interface/online",true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&&xhr.status==200){
            writeCounter(JSON.parse(xhr.responseText));
        }
    };
    xhr.send(null);
}

function writeCounter(jsonData){
    tagListItem={};
    try{
        var doms=document.getElementById("primaryChannelMenu").childNodes;
        for(var i=0;i<doms.length;i++){
            try{
                tagListItem[doms[i].getElementsByClassName("item")[0].childNodes[0].childNodes[0].childNodes[0].textContent]=doms[i].getElementsByTagName("em")[0];
            }catch(e){
                console.log("建立节点表时错误。"+e.message);
            }
        }
    }catch(e){
        console.log("未找到DOM子节点。");
        return;
    }

    var counterData=jsonData.data.region_count;
    var countFangYingTing=0;
    for(var kn_tid in counterData){
        try{
            for(var tagName of tagNameTable[kn_tid]){
                setTagCounter(tagName,counterData[kn_tid]);
                switch(tagName){
                    case "纪录片":case "电影":case "电视剧":
                        countFangYingTing+=counterData[kn_tid];
                        break;
                    default:break;
                }
            }
        }catch(e){
            setTagCounter(kn_tid,counterData[kn_tid]);
        }
    }
    setTagCounter("放映厅",countFangYingTing);
    console.log("%c哔哩哔哩计数器加载完毕。","color:DarkOrange;font-size:large;font-family:PingFang SC,Microsoft Yahei,SimSun");
}

function setTagCounter(tagName,count){
    var logstr=tagName+"区今日上传数："+count;
    try{
        tagListItem[tagName].textContent=count.toString();
    }catch(e){
        logstr+="，未在网页中显示。";
    }
    console.log(logstr);
}
