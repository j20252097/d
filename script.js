// シンプルな麻雀デモエンジン（教育目的・簡略化あり）
const TILES = (()=>{
  const suits = ['m','p','s'];
  const tiles = [];
  for(const s of suits){
    for(let i=1;i<=9;i++){
      for(let k=0;k<4;k++) tiles.push(i + s);
    }
  }
  // シンプルな麻雀デモエンジン（教育目的・簡略化あり）
  // 追加: 役判定・点数計算（簡易）と難易度別CPU、SVGタイル描画でイラスト風表示

  const TILES = (()=>{
    const suits = ['m','p','s'];
    const tiles = [];
    for(const s of suits){
      for(let i=1;i<=9;i++){
        for(let k=0;k<4;k++) tiles.push(i + s);
      // Web Mahjong - script.js (clean implementation)
      // Web Mahjong - script.js (clean implementation)
      // 機能: 配牌・ツモ・打牌、簡易役判定(七対子/タンヤオ/清一色/対々和)、簡易点数計算、難易度別CPU、SVGでの牌表示

      const TILES = (()=>{
        const suits = ['m','p','s'];
        const tiles = [];
        for(const s of suits){
          for(let i=1;i<=9;i++){
            for(let k=0;k<4;k++) tiles.push(i + s);
          }
        }
        return tiles;
      })();

      let wall = [];
      let hands = [[],[],[],[]];
      let discard = [];
      let playerTurn = 0; // 0 = South (You)
      let difficulty = 1; // 0: easy, 1: normal, 2: hard

      const $ = sel => document.querySelector(sel);
      const log = msg => { const el = $('#log'); if(el) el.innerHTML = `<div>${msg}</div>` + el.innerHTML; }

      function shuffle(arr){
        for(let i=arr.length-1;i>0;i--){
          const j = Math.floor(Math.random()*(i+1));
          [arr[i],arr[j]]=[arr[j],arr[i]];
        }
      }

      function tileSVGDataURL(tile, w=40, h=56){
        const n = +tile.slice(0,-1); const s = tile.slice(-1);
        const suitText = {m:'萬',p:'筒',s:'索'}[s] || '';
        const bg = '#fffdf6';
        const stroke = '#e6e6e2';
        const svg = `<?xml version="1.0" encoding="UTF-8"?>` +
          `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
          `<rect x='1' y='1' rx='6' ry='6' width='${w-2}' height='${h-2}' fill='${bg}' stroke='${stroke}' stroke-width='1'/>` +
          `<text x='50%' y='30%' dominant-baseline='middle' text-anchor='middle' font-family='Meiryo,Arial' font-size='14' fill='#111'>${n}</text>` +
          `<text x='50%' y='66%' dominant-baseline='middle' text-anchor='middle' font-family='Meiryo,Arial' font-size='12' fill='#b33'>${suitText}</text>` +
          `</svg>`;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      }

      function renderTileHTML(t){
        if(!t) return '';
        const src = tileSVGDataURL(t);
        return `<img src="${src}" alt="${t}" width="40" height="56" style="display:block">`;
      }

      function newRound(){
        wall = [...TILES];
        shuffle(wall);
        discard = [];
        hands = [[],[],[],[]];
        for(let r=0;r<13;r++){
          for(let p=0;p<4;p++) hands[p].push(drawTile());
        }
        const sel = document.querySelector('#difficulty');
        if(sel) difficulty = +sel.value;
        playerTurn = 0;
        renderAll();
        log('新しい対局が始まりました。あなたの番です。牌をクリックして切ってください。');
      }

      function drawTile(){
        return wall.pop();
      }

      function renderAll(){
        document.querySelectorAll('.hand').forEach(el=>el.innerHTML='');
        for(let p=0;p<4;p++){
          const handEl = document.querySelector(`.hand[data-player="${p}"]`);
          if(!handEl) continue;
          const arr = [...hands[p]];
          if(p===0) arr.sort();
          for(let i=0;i<arr.length;i++){
            const t = arr[i];
            const tile = document.createElement('div');
            tile.className='tile';
            tile.dataset.player = p;
            tile.dataset.idx = i;
            if(p===0){
              tile.innerHTML = renderTileHTML(t);
              tile.addEventListener('click', onPlayerTileClick);
            } else {
              tile.textContent = '🀫';
            }
            handEl.appendChild(tile);
          }
        }
        const pile = document.querySelector('#discard-pile');
        if(pile){
          pile.innerHTML = '';
          for(const t of discard.slice().reverse()){
            const d = document.createElement('div');
            d.className='tile played';
            d.innerHTML = renderTileHTML(t);
            pile.appendChild(d);
          }
        }
      }

      function onPlayerTileClick(e){
        const idx = +e.currentTarget.dataset.idx;
        const tile = hands[0].splice(idx,1)[0];
        e.currentTarget.classList.add('fly-to-discard');
        setTimeout(()=>{
          discard.push(tile);
          renderAll();
          endTurn();
        }, 260);
      }

      function endTurn(){
        playerTurn = (playerTurn+1)%4;
        if(hands[playerTurn]){
          const t = drawTile();
          if(t){
            hands[playerTurn].push(t);
            log(`${playerName(playerTurn)} がツモりました`);
            const win = evaluateWinning(hands[playerTurn]);
            if(win && win.points>0){
              renderAll();
              log(`${playerName(playerTurn)} が和了！ ${win.desc} 得点: ${win.points}`);
              return;
            }
          } else {
            log('山が尽きました。流局です。');
            return;
          }
        }
        if(playerTurn !== 0){
          setTimeout(()=>cpuPlay(playerTurn), 520);
        } else {
          renderAll();
        }
      }

      function playerName(p){
        if(p===0) return 'あなた';
        return 'CPU ' + p;
      }

      function cpuPlay(p){
        const hand = hands[p];
        let pick = 0;
        if(difficulty===0){
          pick = Math.floor(Math.random()*hand.length);
        } else if(difficulty===1){
          const freq = {};
          hand.forEach(t=>freq[t] = (freq[t]||0)+1);
          const idx = hand.findIndex(t => freq[t]===1);
          pick = (idx>=0) ? idx : Math.floor(Math.random()*hand.length);
        } else {
          let bestScore = Infinity; pick = 0;
          for(let i=0;i<hand.length;i++){
            const trial = hand.slice();
            trial.splice(i,1);
            const s = evaluateShanten(trial);
            if(s < bestScore){ bestScore = s; pick = i; }
          }
        }
        const tile = hand.splice(pick,1)[0];
        const handEl = document.querySelector(`.hand[data-player="${p}"]`);
        if(handEl){
          const tileEl = document.createElement('div');
          tileEl.className='tile fly-to-discard';
          tileEl.textContent='🀫';
          handEl.appendChild(tileEl);
        }
        setTimeout(()=>{
          discard.push(tile);
          renderAll();
          log(`${playerName(p)} が ${renderTileText(tile)} を切りました`);
          endTurn();
        }, 400);
      }

      function renderTileText(t){
        if(!t) return '';
        const n = t.slice(0,-1); const s = t.slice(-1);
        const suits = {m:'萬',p:'筒',s:'索'};
        return n + suits[s];
      }

      // --- Hand evaluation helpers (簡易) ---
      function evaluateShanten(hand){
        const counts = {m: Array(10).fill(0), p: Array(10).fill(0), s: Array(10).fill(0)};
        for(const t of hand){
          const n = +t.slice(0,-1); const su = t.slice(-1);
          counts[su][n]++;
        }
        let isolated = 0;
        for(const su of ['m','p','s']){
          for(let i=1;i<=9;i++){
            if(counts[su][i]===0) continue;
            const c = counts[su][i];
            const neighbors = (counts[su][i-2]||0)+(counts[su][i-1]||0)+(counts[su][i+1]||0)+(counts[su][i+2]||0);
            if(c===1 && neighbors===0) isolated += 1;
          }
        }
        return isolated;
      }

      function evaluateWinning(hand){
        if(hand.length !== 14) return null;
        const counts = {};
        for(const t of hand) counts[t] = (counts[t]||0)+1;
        const isChiitoi = Object.values(counts).filter(c=>c===2).length === 7;
        const suits = new Set(hand.map(t=>t.slice(-1)));
        const isFlush = suits.size === 1;
        const hasTerminal = hand.some(t=>{ const n=+t.slice(0,-1); return n===1||n===9; });
        const isTanyao = !hasTerminal;
        const tripCount = Object.values(counts).filter(c=>c>=3).length;
        const pair = Object.values(counts).filter(c=>c%3===2||c===2).length>0;
        const isToitoi = tripCount>=4 && pair;
        let han = 0;
        if(isChiitoi) han += 2;
        if(isTanyao) han += 1;
        if(isFlush) han += 3;
        if(isToitoi) han += 2;
        if(han===0) return {han:0,points:0,desc:'和了（役なし: 簡略）'};
        const basePoints = 20 * Math.pow(2, han);
        return {han,points:basePoints,desc:`${han}翻の和了`};
      }

      document.addEventListener('DOMContentLoaded', ()=>{
        const start = document.querySelector('#startBtn');
        if(start) start.addEventListener('click', ()=> newRound());
        const autoBtn = document.querySelector('#autoPlayBtn');
        if(autoBtn) autoBtn.addEventListener('click', ()=>{
          if(playerTurn===0){
            if(hands[0].length>0){
              const tile = hands[0].splice(0,1)[0];
              discard.push(tile);
              renderAll();
              endTurn();
            }
          }
        });
        const hintBtn = document.querySelector('#hintBtn');
        if(hintBtn) hintBtn.addEventListener('click', ()=>{
          if(hands[0].length===0) return;
          const idx = Math.floor(Math.random()*hands[0].length);
          log('ヒント: ' + renderTileText(hands[0][idx]));
        });
      });