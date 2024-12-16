// ==UserScript==
// @name         自动展开弹幕列表
// @namespace    https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @version      1.0.2
// @updateURL    https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @downloadURL  https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @description  自动展开弹幕列表
// @author       lxfly2000
// @match        *://*.bilibili.com/
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

let BilibiliAutoUnfoldDanmakuList_mo=new MutationObserver(mutations=>BilibiliAutoUnfoldDanmakuList_Main());

function BilibiliAutoUnfoldDanmakuList_StartObserve(){
    BilibiliAutoUnfoldDanmakuList_mo.observe(document.getRootNode(),{attributes:false,childList:false,characterData:true,subtree:true});
}

function BilibiliAutoUnfoldDanmakuList_StopObserve(){
    BilibiliAutoUnfoldDanmakuList_mo.disconnect();
}

function BilibiliAutoUnfoldDanmakuList_Main(){
    "use strict";
    BilibiliAutoUnfoldDanmakuList_StopObserve();
    var headers=document.getElementsByClassName('bui-collapse-header');
    for(var h of headers){
        if(h.parentElement.classList.contains('bui-collapse-wrap-folded')){
            h.click();
            console.log("展开弹幕列表窗口…");
        }
    }
    BilibiliAutoUnfoldDanmakuList_StartObserve();
}

(function() {
    "use strict";

    BilibiliAutoUnfoldDanmakuList_Main();
})();
