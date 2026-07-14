/* ==============================================================
   family-players.js
   全家遊戲間 —— 共用玩家系統

   設計原則：玩家設定只有「一個真相來源」。
   在大廳設定一次，五款遊戲全部自動套用。
   遊戲程式只認 FP.get() 回傳的陣列，不再寫死任何名字。
   ============================================================== */
(function (global) {
  'use strict';

  var KEY = 'family-players-v1';

  /* 難度：每個玩家自己一級。遊戲拿 mul（乘數）去調自己的參數。 */
  var LEVELS = {
    easy:   { key:'easy',   label:'簡單', desc:'時間長、判定寬鬆',
              timeMul: 1.4, loose: 2 },   // loose 越大 = 越好過
    normal: { key:'normal', label:'普通', desc:'標準',
              timeMul: 1.0, loose: 1 },
    hard:   { key:'hard',   label:'困難', desc:'時間短、判定嚴格',
              timeMul: 0.7, loose: 0 },
  };

  var EMOJIS = ['🧒','🧑','🧔','👩','👦','👧','👴','👵','🐱','🐶','🦊','🐼','🦁','🐸','🤖','👽'];

  var DEFAULTS = [
    { name:'George', emoji:'🧒', level:'easy'   },
    { name:'Win',    emoji:'🧑', level:'normal' },
    { name:'爸爸',   emoji:'🧔', level:'hard'   },
  ];

  function clean(list) {
    if (!Array.isArray(list) || !list.length) return DEFAULTS.slice();
    return list.slice(0, 6).map(function (p, i) {
      return {
        name:  String(p && p.name || '').trim().slice(0, 8) || ('玩家' + (i + 1)),
        emoji: (p && p.emoji) || EMOJIS[i % EMOJIS.length],
        level: LEVELS[p && p.level] ? p.level : 'normal',
      };
    });
  }

  var FP = {
    KEY: KEY,
    LEVELS: LEVELS,
    EMOJIS: EMOJIS,
    DEFAULTS: DEFAULTS,

    /* 拿玩家名單（永遠回傳至少 1 個人，不會是空的） */
    get: function () {
      try {
        return clean(JSON.parse(localStorage.getItem(KEY)));
      } catch (e) {
        return DEFAULTS.slice();
      }
    },

    set: function (list) {
      try { localStorage.setItem(KEY, JSON.stringify(clean(list))); } catch (e) {}
    },

    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
    },

    /* 拿某個玩家的難度設定 */
    lv: function (p) {
      return LEVELS[p && p.level] || LEVELS.normal;
    },

    /* 依難度算時間：base 秒 × 乘數 */
    secs: function (p, base) {
      return Math.round(base * FP.lv(p).timeMul);
    },

    /* 顯示用：🧒 George */
    tag: function (p) {
      return (p && p.emoji ? p.emoji + ' ' : '') + (p && p.name || '');
    },
  };

  global.FP = FP;
})(window);
