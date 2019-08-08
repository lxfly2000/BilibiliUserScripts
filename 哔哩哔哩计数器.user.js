// ==UserScript==
// @name         哔哩哔哩计数器
// @namespace    https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @version      1.7.4
// @updateURL    https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @downloadURL  https://github.com/lxfly2000/BilibiliCounter/raw/master/哔哩哔哩计数器.user.js
// @description  显示哔哩哔哩上传视频数的实际计数
// @author       lxfly2000
// @match        *://www.bilibili.com/
// @match        *://www.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    addEventListener("load",bilibiliCounter);//等页面加载完后再执行否则会被覆盖
})();

var tagListItem={};//分区名（网页上）——DOM节点
var tagNameTable={"167":"国创"};//tid与分区名（ZoneConfig定义）转换表

function bilibiliCounter(){
    getHomeLink();
}

function getHomeLink(){
    var xhr=new XMLHttpRequest();
    xhr.open("GET","//www.bilibili.com/index.html",true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&&xhr.status==200){
            var homelink="";
            var homereg=new RegExp("//s[0-9]\\.hdslb\\.com/bfs/static/jinkela/home/home\\.?[^\\.]+\\.js");
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
    var zoneConfigReg=new RegExp("\\[{type:[^\\[\\]]+\\]");
    var zoneConfigText="";
    var regmatch=src_text.match(zoneConfigReg);
    if(regmatch==null){
        console.log("无法找到分区配置。");
        return;
    }else{
        zoneConfigText=regmatch[0];
    }
    var nameReg=new RegExp("name:\"[^\"]+\"","g");
    var tidReg=new RegExp("tid:[^,]+","g");
    var namesMatch=zoneConfigText.match(nameReg);
    var tidsMatch=zoneConfigText.match(tidReg);//因为它并不是标准的JSON格式所以就没法用JSON的方式了
    for(var i=0;i<namesMatch.length;){
        //2019-3-30：分区配置中多出一个“专栏”的项目，但它没有tid属性因此先排除。
        //2019-8-8：分区配置中又多出一个“漫画”的项目，同上
        var name=namesMatch[i].substring(6,namesMatch[i].lastIndexOf("\""));
        if(name=="专栏"||name=="漫画"){
            namesMatch.splice(i,1);
            console.log(`%c${name}暂时没有统计数据。`,"color:DeepPink;font-size:400%;font-family:PingFang SC,Microsoft Yahei,SimSun");//这个叫模板字符串，是ES6中新引入的。
        }else{
            tagNameTable[tidsMatch[i].substring(4)]=name;//注意tid要转换成字符串
            i++;
        }
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
    var doms;
    try{
        doms=document.getElementById("primary_menu").getElementsByTagName("ul")[0].childNodes;
    }catch(e){
        return;
    }
    for(var i=0;i<doms.length;i++){
        try{
            tagListItem[doms[i].getElementsByClassName("nav-name")[0].textContent]=doms[i].getElementsByClassName("num-wrap")[0].getElementsByTagName("span")[0];
        }catch(e){
            //Nothing to do.
        }
    }

    var counterData=jsonData.data.region_count;
    var countFangYingTing=0;
    for(var kn in counterData){
        var tagName=getBiliTagNameById(kn);
        setTagCounter(tagName,counterData[kn]);
        switch(tagName){
            case "纪录片":case "电影":case "电视剧":
                countFangYingTing+=counterData[kn];
                break;
            default:break;
        }
    }
    setTagCounter("放映厅",countFangYingTing);
    console.log("%c哔哩哔哩计数器加载完毕。","color:DarkOrange;font-size:large;font-family:PingFang SC,Microsoft Yahei,SimSun");
}

function getBiliTagNameById(tid){
    return tagNameTable[tid];
}

function setTagCounter(tagName,count){
    var logstr=tagName+"区今日上传数："+count;
    try{
        tagListItem[tagName].style.maxWidth="none";
        tagListItem[tagName].textContent=count.toString();
    }catch(e){
        logstr+="，未在网页中显示。";
    }
    console.log(logstr);
}
