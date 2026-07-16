/* ==============================================================
   family-players.js  v2
   全家遊戲間 —— 共用玩家系統（唯一真相來源）

   v2 新增：gender 欄位（boy / girl / none），預設 none（不選）。
   遊戲用 FP.get() 拿名單；用 FP.lv(p) 拿難度參數。
   ============================================================== */
(function (global) {
  'use strict';

  var KEY = 'family-players-v1';

  var LEVELS = {
    easy:   { key:'easy',   label:'簡單', timeMul: 1.4, loose: 2 },
    normal: { key:'normal', label:'普通', timeMul: 1.0, loose: 1 },
    hard:   { key:'hard',   label:'困難', timeMul: 0.7, loose: 0 },
  };

  var GENDERS = {
    none: { key:'none', label:'不選' },
    boy:  { key:'boy',  label:'男生' },
    girl: { key:'girl', label:'女生' },
  };

  var EMOJIS = ['🧒','🧑','🧔','👧','👩','👦','👴','👵','🐱','🐶','🦊','🐼','🦁','🐸','🤖','👽'];

  var DEFAULTS = [
    { name:'George', emoji:'🧒', level:'easy',   gender:'boy'  },
    { name:'Win',    emoji:'🧑', level:'normal', gender:'boy'  },
    { name:'爸爸',   emoji:'🧔', level:'hard',   gender:'none' },
  ];

  function clean(list) {
    if (!Array.isArray(list) || !list.length) return DEFAULTS.map(function(p){ return Object.assign({}, p); });
    return list.slice(0, 6).map(function (p, i) {
      return {
        name:   String(p && p.name || '').trim().slice(0, 8) || ('玩家' + (i + 1)),
        emoji:  (p && p.emoji) || EMOJIS[i % EMOJIS.length],
        level:  LEVELS[p && p.level] ? p.level : 'normal',
        gender: GENDERS[p && p.gender] ? p.gender : 'none',
      };
    });
  }

  var FP = {
    KEY: KEY,
    LEVELS: LEVELS,
    GENDERS: GENDERS,
    EMOJIS: EMOJIS,
    DEFAULTS: DEFAULTS,

    get: function () {
      try { return clean(JSON.parse(localStorage.getItem(KEY))); }
      catch (e) { return DEFAULTS.map(function(p){ return Object.assign({}, p); }); }
    },
    set: function (list) {
      try { localStorage.setItem(KEY, JSON.stringify(clean(list))); } catch (e) {}
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },

    lv: function (p) { return LEVELS[p && p.level] || LEVELS.normal; },
    gd: function (p) { return GENDERS[p && p.gender] || GENDERS.none; },
    secs: function (p, base) { return Math.round(base * FP.lv(p).timeMul); },
    tag: function (p) { return (p && p.emoji ? p.emoji + ' ' : '') + (p && p.name || ''); },
  };

  /* ============================================================
     縮放鎖：小孩兩指誤觸會把畫面放大縮小弄跑掉。
     這裡把「雙指縮放」和「雙擊放大」全部擋掉。
     所有引入本檔的遊戲自動生效，不用各自寫。
     （canvas 上的單指畫圖不受影響）
     ============================================================ */
  function lockZoom() {
    /* 雙擊放大：用 CSS touch-action 解，不會影響按鈕點擊 */
    try {
      var st = document.createElement('style');
      st.textContent = 'html,body,button,a,input,div,section{touch-action:manipulation}';
      document.head.appendChild(st);
    } catch (e) {}

    /* iOS 的捏合手勢事件 */
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
    });

    /* 兩指以上：起手（touchstart）和移動（touchmove）都擋掉（單指不受影響） */
    document.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    /* 第二道鎖：0.3 秒內連點兩下 = 雙擊放大 → 攔截。
       但如果點的是按鈕/連結/輸入框就放行，不影響快速連按按鈕。 */
    var lastTap = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTap <= 300) {
        var t = e.target;
        var interactive = t && t.closest && t.closest('button,a,input,textarea,select,label');
        if (!interactive) e.preventDefault();
      }
      lastTap = now;
    }, { passive: false });
  }
  lockZoom();

  global.FP = FP;
})(window);
