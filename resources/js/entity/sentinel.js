import { Level } from "../level.js";
import { Vec2 } from "../vec2.js";
import { Entity } from "./entity.js";

export class Sentinel extends Entity {

  constructor(x, y, level) {
    super(x, y, level);
    super.color = "#CE352C";

    this.breakTime = 250;
    this.time = 0;

    this.attackSpeed = 15;
    this.normalSpeed = 5;
    this.speed = this.normalSpeed;

    this.viewPoints = null;
  }

  onMissRoute() {
    if(!this.tryToAttack(this.player.position)) {
      this.speed = this.normalSpeed;
      this.findRoute();
    }
  }

  findRoute() {
    new Promise(() => {
      this.time = 0;
      const x = Math.floor(Level.TILE_SIZE * Math.random() * this.level.cols);
      const y = Math.floor(Level.TILE_SIZE * Math.random() * this.level.rows);
      super.walkTo(x, y);
    });
  }

  update(dt) {
    super.update(dt);

    if(this.needUpdate) {      
      this.viewPoints = [];
      for(let r = -0.5; r < 0.5; r += 0.05) {
          let d = new Vec2(this.direction).rotate(r);
          let hit = this.level.ray(this.position, d, 200);
          if(hit) {
            this.viewPoints.push(hit);               
          }
      }
    }

    if(this.speed !== this.attackSpeed) {
      this.tryToAttack(this.player.position);
    }    
  }

  tryToAttack(position) {

    if(this.contains(position)) {
      super.walkTo(position.x, position.y);
      this.speed = this.attackSpeed;
      return true;
    }

    return false;
  }

  render(camera) {        
    if(this.viewPoints && this.viewPoints.length > 0) {
      let context = camera.context;
      context.save();
      context.globalAlpha = 0.25;
      context.fillStyle = '#5F5';
      context.beginPath();
      context.moveTo(this.position.x, this.position.y);
      for(let i = 0; i < this.viewPoints.length; ++i) {
          let p = this.viewPoints[i];
          context.lineTo(p.x,p.y);
      }
      context.closePath();
      context.fill();
      context.restore();
    }
    super.render(camera);     
  }

}
