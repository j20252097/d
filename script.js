// シンプルな麻雀デモエンジン（教育目的・簡略化あり）
const TILES = (()=>{
  const suits = ['m','p','s'];
  const tiles = [];
  for(const s of suits){
    for(let i=1;i<=9;i++){
      for(let k=0;k<4;k++) tiles.push(i + s);
    }
  }
  // 東南西北の簡略：鳴きや役は簡略化するため抜く
  return tiles;
})();

let wall = [];
let hands = [[],[],[],[]];
let discard = [];
let playerTurn = 0; // 0 = South (You)

const $ = sel => document.querySelector(sel);
const log = msg => { const el = $('#log'); el.innerHTML = `<div>${msg}</div>` + el.innerHTML; }

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}

function newRound(){
  wall = [...TILES];
  shuffle(wall);
  discard = [];
  hands = [[],[],[],[]];
  // deal: 13 to each, then next player draws when turn
  for(let r=0;r<13;r++){
    for(let p=0;p<4;p++) hands[p].push(drawTile());
  }
  playerTurn = 0; // user starts for demo
  renderAll();
  log('新しい対局が始まりました。あなたの番です。牌をクリックして切ってください。');
}

function drawTile(){
  return wall.pop();
}

function renderAll(){
  // render players' hands
  document.querySelectorAll('.hand').forEach(el=>el.innerHTML='');
  for(let p=0;p<4;p++){
    const handEl = document.querySelector(`.hand[data-player="${p}"]`);
    const arr = [...hands[p]];
    if(p===0){
      // sort for user
      arr.sort();
    } else {
      // hide CPU tiles (show back)
    }
    for(let i=0;i<arr.length;i++){
      const t = arr[i];
      const tile = document.createElement('div');
      tile.className='tile';
      tile.dataset.player = p;
      tile.dataset.idx = i;
      tile.textContent = (p===0) ? renderTile(t) : '🀫';
      if(p===0){
        tile.addEventListener('click', onPlayerTileClick);
      }
      handEl.appendChild(tile);
    }
  }

  // discard pile
  const pile = document.querySelector('#discard-pile');
  pile.innerHTML = '';
  for(const t of discard.slice().reverse()){
    const d = document.createElement('div');
    d.className='tile played';
    d.textContent = renderTile(t);
    pile.appendChild(d);
  }
}

function renderTile(t){
  if(!t) return '';
  const n = t.slice(0,-1); const s = t.slice(-1);
  const suits = {m:'萬',p:'筒',s:'索'};
  return n + suits[s];
}

function onPlayerTileClick(e){
  const idx = +e.currentTarget.dataset.idx;
  const tile = hands[0].splice(idx,1)[0];
  // animate
  e.currentTarget.classList.add('fly-to-discard');
  setTimeout(()=>{
    discard.push(tile);
    renderAll();
    endTurn();
  }, 260);
}

function endTurn(){
  // draw for next player
  playerTurn = (playerTurn+1)%4;
  if(hands[playerTurn]){
    const t = drawTile();
    if(t){
      hands[playerTurn].push(t);
      log(`${playerName(playerTurn)} がツモりました`);
    } else {
      log('山が尽きました。流局です。');
      return;
    }
  }
  // if CPU, make a simple discard
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
  // naive: discard random tile, prefer duplicates keep
  const hand = hands[p];
  const freq = {};
  hand.forEach(t=>freq[t] = (freq[t]||0)+1);
  let pick = 0;
  for(let i=0;i<hand.length;i++){
    if(freq[hand[i]]===1){ pick = i; break; }
  }
  // fallback random
  if(!hand[pick]) pick = Math.floor(Math.random()*hand.length);
  const tile = hand.splice(pick,1)[0];
  // animate by creating a fake tile element and moving it
  const handEl = document.querySelector(`.hand[data-player="${p}"]`);
  const tileEl = document.createElement('div');
  tileEl.className='tile fly-to-discard';
  tileEl.textContent='🀫';
  handEl.appendChild(tileEl);
  setTimeout(()=>{
    discard.push(tile);
    renderAll();
    log(`${playerName(p)} が ${renderTile(tile)} を切りました`);
    endTurn();
  }, 400);
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelector('#startBtn').addEventListener('click', ()=>{
    newRound();
  });
  document.querySelector('#autoPlayBtn').addEventListener('click', ()=>{
    // simple autoplay: if it's player's turn, auto-discard first tile
    if(playerTurn===0){
      if(hands[0].length>0){
        const tile = hands[0].splice(0,1)[0];
        discard.push(tile);
        renderAll();
        endTurn();
      }
    }
  });
  document.querySelector('#hintBtn').addEventListener('click', ()=>{
    // show simple hint: suggest a tile to discard (random)
    if(hands[0].length===0) return;
    const idx = Math.floor(Math.random()*hands[0].length);
    log('ヒント: ' + renderTile(hands[0][idx]));
  });
});