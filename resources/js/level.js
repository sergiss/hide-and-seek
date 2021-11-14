import { AStar, Grid, Node } from "./utils/astar.js";
import { Random } from "./utils/random.js";
import { computeColor} from "./utils/utils.js";
import { Vec2 } from "./vec2.js";

class LevelNode extends Node {
  constructor(x, y, tileIndex) {
    super(x, y);
    this.tileIndex = tileIndex;
    this.wx = x * Level.TILE_SIZE + Level.TILE_SIZE * 0.5;
    this.wy = y * Level.TILE_SIZE + Level.TILE_SIZE * 0.5;
  }
  isObstacle() {
    return Level.TILES[this.tileIndex].obstacle;
  }
}

export class Level extends Grid {

  static TILE_SIZE = 32;

  static TILES = [
    { name: "floor", color: "#647687", lineWidth: 1, obstacle: false }, // 0
    { name: "wall" , color: "#999999", lineWidth: 2, obstacle: true  }, // 1
    { name: "door" , color: "#7C503F", lineWidth: 2, obstacle: false  }, // 2
    { name: "hall" , color: "#FFb9cd", lineWidth: 2, obstacle: false  }  // 3
  ];

  constructor(cols, rows, seed = Math.random() * 9999999) {
    super();

    this.cols = cols;
    this.rows = rows;

    this.aStar = new AStar(this);
    this.random = new Random(seed);

    this.clear();
  }

  clear() {

    do {
      this.data = [];
      for (let node, j, i = 0; i < this.cols; ++i) {
        for (j = 0; j < this.rows; ++j) {
          node = new LevelNode(i, j, this.random.nextFloat() > 0.75 ? 1 : 0);
          this.data[i + j * this.cols] = node;
        }
      }
    } while(!this.isPositionAccessible(this.cols - 1, this.rows - 1));

    // this.generateDungeon();

    this.entities = [];
  }

  generateDungeon(seed = Math.random() * 9999999) {
    
    const data = [];
    this.random = new Random(seed);

    let min = 6, 
        max = 13,
        diff = max - min;
    
    let n = 5;
    let retries = 10;

    for(let x, y, x1, y1, x2, y2, i1 = 0; i1 < n; ++i1) {

      outer: for(let i = 0; i < retries; ++i) {
        x1 = this.random.nextInt(this.cols);
        y1 = this.random.nextInt(this.rows);

        x2 = x1 + min + this.random.nextInt(diff);
        y2 = y1 + min + this.random.nextInt(diff);

        if(x2 < this.cols && y2 < this.rows) {
          let tmp = {};         
          for(x = x1; x <= x2; ++x) {
            for(y = y1; y <= y2; ++y) {
              let index = x + y * this.cols;
              if(data[index] === 1) {
                continue outer;
              }
              if(x > x1 && x < x2 && y > y1 && y < y2) {
                tmp[index] = 1;
              }
            }
          }
          for (const index in tmp) {
            data[index] = tmp[index];
          }
          break;
        }        
      }

    }

    this.data = [];
    for (let index, node, j, i = 0; i < this.cols; ++i) {
      for (j = 0; j < this.rows; ++j) {
        index = i + j * this.cols;
        let v = data[index];
        if(v == undefined) {
          v = this.random.nextFloat() < 0.35 ? 1 : 0;
        } else if(v === 1) {
          v = 0;
        }
        node = new LevelNode(i, j, v);
        this.data[index] = node;
      }
    }

  }

  ray (position, normal, dst) {

    const e = 0.0001;

    const p0 = new Vec2(position).div(Level.TILE_SIZE).floor().scl(Level.TILE_SIZE).add(Level.TILE_SIZE * 0.5);
    const p1 = new Vec2(normal).scl(dst).add(position);

    const difX = p1.x - p0.x;
    const difY = p1.y - p0.y;
    const dist = Math.abs(difX) + Math.abs(difY);

    let dx = difX / dist;
    let dy = difY / dist;

    for (let x, y, wx, wy, i = 0; i <= dist; i++) {
      wx = p0.x + dx * i + e;
      wy = p0.y + dy * i + e;

      x = Math.floor(wx / Level.TILE_SIZE);
      y = Math.floor(wy / Level.TILE_SIZE);

      if(x < 0 || x >= this.cols 
      || y < 0 || y >= this.rows) {
        return new Vec2(wx, wy);
      }

      let node = this.getNode(x, y);
      if(node.isObstacle()) {
        return new Vec2(wx, wy);
      }
     
    }
   
    return p1;
  }

  isPositionAccessible(x, y) {
    return this.aStar.route(this.getNode(x, y), this.getNode(0, 0));
  }

  getNode(x, y) {
    return this.data[x + y * this.cols];
  }

  getCols() {
    return this.cols;
  }

  getRows() {
    return this.rows;
  }

  getRandomLocation(free) {
    let result;
    do {
      result = new Vec2(this.random.nextInt(this.cols), this.random.nextInt(this.rows));
    } while(free && (this.getNode(result.x, result.y).isObstacle() || !this.isPositionAccessible(result.x, result.y)));
    return result.scl(Level.TILE_SIZE).add(Level.TILE_SIZE * 0.5);
  }

  addAtRandomLocation(entity) {
    this.entities.push(entity);
    entity.position.set(this.getRandomLocation(true));
  }

  add(entity) {
    this.entities.push(entity);
  }

  remove(entity) {
    this.entities.remove(entity);
  }

  render(camera, pointLight) {

    let hl = pointLight.light * 0.5;

    const ctx = camera.context;
    const viewport = camera.viewport;

    ctx.fillStyle = '#111';
    ctx.fillRect(viewport.x1, viewport.y1, viewport.getWidth(), viewport.getHeight());

    for (let x, y, tile, node, j, i = 0; i < this.cols; ++i) {
      for (j = 0; j < this.rows; ++j) {
        x = i * Level.TILE_SIZE;
        y = j * Level.TILE_SIZE;
        if(x + Level.TILE_SIZE > viewport.x1
        && y + Level.TILE_SIZE > viewport.y1
        && x < viewport.x2
        && y < viewport.y2) {
          node = this.data[i + j * this.cols];
          tile = Level.TILES[node.tileIndex];  
          if(pointLight.isVisible(node.wx, node.wy)) {        
            ctx.globalAlpha = pointLight.light;          
          } else {
            ctx.globalAlpha = hl;
          }
          ctx.beginPath();
          ctx.rect(x, y, Level.TILE_SIZE, Level.TILE_SIZE);
          ctx.fillStyle = tile.color;
          ctx.fill();
          if(tile.lineWidth) {
            ctx.lineWidth = tile.lineWidth;
            ctx.strokeStyle = computeColor(ctx.fillStyle, 0.75);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = pointLight.light;
    for(let entity, i = 0; i < this.entities.length; ++i) {
      entity = this.entities[i];
      if(pointLight.isVisible(entity.position.x, entity.position.y)) {
        entity.render(camera);
      }
    }

  } 

  update(dt) {
    for(let entity, i = 0; i < this.entities.length; ++i) {
      entity = this.entities[i];
      entity.update(dt);
    }
  }

  getSize() {
    return {
      width  : this.cols * Level.TILE_SIZE,
      height : this.rows * Level.TILE_SIZE
    }
  }

}