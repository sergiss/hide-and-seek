import { Level } from "../level.js";
import { intersectSegmentCircle, renderPolygon } from "../utils/utils.js";
import { Vec2 } from "../vec2.js";
import { Entity } from "./entity.js";

export class Sentinel extends Entity {

  constructor(x, y, level) {
    super(x, y, level);
    super.color = "#CE352C";

    this.breakTime = 250;
    this.time = 0;

    this.viewAngle = 0.4;

    this.attackSpeed = 9;
    this.normalSpeed = 5;
    this.speed = this.normalSpeed;

    this.viewPoints = null;
  }

  onMissRoute() {
    if(!this.tryToAttack(this.player)) {
      this.speed = this.normalSpeed;
      this.needUpdate = true;
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
      const angle = this.speed === this.attackSpeed ? Math.PI : this.viewAngle;
      this.viewPoints = this.computeViewPoints(angle, 200);
    }

    if(this.speed !== this.attackSpeed) {
      this.tryToAttack(this.player);
    }    
  }

  tryToAttack(entity) {

    if(this.isVisible(entity)) {
      super.walkTo(entity.position.x, entity.position.y);
      this.speed = this.attackSpeed;
      this.needUpdate = true;
      return true;
    }

    return false;
  }

  isVisible(entity) {
    if(this.viewPoints && this.viewPoints.length > 1) {
      let center = this.position;
      for(let i = 0; i < this.viewPoints.length; ++i) {
        let p = this.viewPoints[i];
        if(intersectSegmentCircle(center, p, entity.position, entity.radius * entity.radius)) {
          return true;
        }
      }
    }
    return false;
  }

  render(camera) {     
    // render view points   
    if(this.viewPoints) {
      const fillStyle = this.speed == this.normalSpeed ? '#5F5' : '#F55';
      renderPolygon(camera.context, [this.position, ...this.viewPoints], fillStyle, 0.25);
    }
    super.render(camera);     
  }

}
