// ==UserScript==
// @name         自动展开弹幕列表
// @namespace    https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @version      1.0.0
// @updateURL    https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @downloadURL  https://github.com/lxfly2000/BilibiliUserScripts/raw/master/自动展开弹幕列表.user.js
// @description  自动展开弹幕列表
// @author       lxfly2000
// @match        *://*.bilibili.com/
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    var headers=document.getElementsByClassName('bui-collapse-header');
    for(var h of headers){
        if(h.parentElement.classList.contains('bui-collapse-wrap-folded')){
            h.click();
        }
    }
})();
