import { Level } from "../level.js";
import { Vec2 } from "../vec2.js";
import { Entity } from "./entity.js";

export class PointLight extends Entity {

    constructor(x, y, level) {
        super(x, y, level);
        this.light = 1;

        this.lightRadius = Level.TILE_SIZE * 20000 / 32;

        this.lastPosition = new Vec2(-1, -1);
        this.data = [];

        this.intensity = 6;
        this.decrement = 1;
    }

    update(dt) {
        super.update(dt);

        /*if(this.needUpdate) {

            // Flood fill

            this.data = [];

            const points = [{
                x: this.lastPosition.x,
                y: this.lastPosition.y,
                light: this.intensity
            }];

            while(points.length > 0) {

                let point = points.shift();
                let {x, y, light } = point;            

                if(this.level.getNode(x, y).isObstacle()) {
                    this.data[x + y * this.level.cols] = light * 0.5;
                    continue;
                } else {
                    this.data[x + y * this.level.cols] = light;
                }
                
                if(light - this.decrement > this.decrement ) {
                   
                    if(x - 1 >= 0 && this.data[x - 1 + y * this.level.cols] === undefined) {
                        points.push({
                            x: x - 1,
                            y: y,
                            light: light - this.decrement
                        });
                    }

                    if(x + 1 < this.level.cols && this.data[x + 1 + y * this.level.cols] === undefined) {
                        points.push({
                            x: x + 1,
                            y: y,
                            light: light - this.decrement
                        });
                    }

                    if(y - 1 >= 0 && this.data[x + (y - 1) * this.level.cols] === undefined) {
                        points.push({
                            x: x,
                            y: y - 1,
                            light: light - this.decrement
                        });
                    }

                    if(y + 1 < this.level.cols && this.data[x + (y + 1) * this.level.cols] === undefined) {
                        points.push({
                            x: x,
                            y: y + 1,
                            light: light - this.decrement
                        });
                    }
                    
                    
                }                

            }

        }*/
    }

    getPosition() {
        return super.position;
    }

    getLight(x, y) {
        return this.light * 0.25 + this.light * ((this.data[x + y * this.level.cols] || 0) * 0.75 / this.intensity);
    }

    getLightRadius() {
        return this.lightRadius;
    }

    isVisible(x, y) {
        return this.position.dst2(x, y) < this.lightRadius;
    }

} 