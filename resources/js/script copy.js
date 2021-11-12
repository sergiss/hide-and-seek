import { Level } from "./level.js";
import { Camera } from "./camera.js";
import { Player } from "./entity/player.js";
import { Sentinel } from "./entity/sentinel.js";

const canvas = document.querySelector("#canvas");

const camera = new Camera(canvas);
const level = new Level(50, 50);

const player = new Player(0, 0, level);
level.addAtRandomLocation(player);

let sentinels = [];
for(let i = 0; i < 1; ++i) {
  let sentinel = new Sentinel(level.cols * 32, level.rows * 32, level);
  level.addAtRandomLocation(sentinel);

  sentinels.push(sentinel);
}

var time = 0;
var hideTime = 500;
var searchTime = 500;
var state = 0; // 0 hide - 1 search

let info = document.querySelector("#info");
info.innerHTML = "Huye!";

const render = () => {

  if(state == 0) {
    if(time > hideTime) {
      time = 0;
      state = 1;
      sentinels.map((s)=> {
        s.findRoute();
      })
      info.innerHTML = "Escondete!";
    }
  }  else {
    
    if(time > searchTime) {
      time = 0;
      state = 0;
      info.innerHTML = "Huye!";
      sentinels.map((s)=> {
        s.route = null;
      })
    }

  }
  time++;

  level.update(0.25);
  camera.follow(player.position, level.getSize(), 0.5);
  camera.update();
  level.render(camera, player);  
  requestAnimationFrame(render);
};
requestAnimationFrame(render);

const getCoords = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
};

canvas.addEventListener("mouseup", (e) => {
  const coords = getCoords(e);
  const position = camera.screenToWorld(coords.x, coords.y);
  player.walkTo(position.x, position.y);
});
