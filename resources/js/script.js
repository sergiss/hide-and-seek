import { Level } from "./level.js";
import { Camera } from "./camera.js";
import { Player } from "./entity/player.js";
import { Sentinel } from "./entity/sentinel.js";

const canvas = document.querySelector("#canvas");
const info = document.querySelector("#info");

const camera = new Camera(canvas);
var level, player, sentinels;

const create = ()=> {
  level = new Level(20, 20);
  player = new Player(0, 0, level);
  level.addAtRandomLocation(player);
  sentinels = [];
  for(let i = 0; i < 5; ++i) {
    let sentinel = new Sentinel((level.cols - 1) * 32, (level.rows - 1) * 32, level);
    sentinel.player = player;
    level.add(sentinel);
    sentinels.push(sentinel);
  }
}
create();

var time = 0;
const render = () => {

  for(let i = 0; i < sentinels.length; ++i) {
    let sentinel = sentinels[i];
    if(sentinel.overlaps(player)) {
      create(); // Game Over
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
