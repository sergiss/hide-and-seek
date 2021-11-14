import { Level } from "../level.js";
import { computeColor, moveTo } from "../utils/utils.js";
import { Vec2 } from "../vec2.js";

import { AStar } from "../utils/astar.js";

export class Entity {

    constructor(x, y, level) {       
        this.position = new Vec2(x, y);

        this.level = level;
        this.aStar = new AStar(level);

        this.color = '#FFF';
        this.radius = Level.TILE_SIZE * 0.5;

        this.threshold = 1;
        this.speed = 10;

        this.direction = new Vec2(1, 0);

        this.lastPosition = new Vec2(-1, -1);
        this.needUpdate = false;
        
    }

    render(camera) {        
        const context = camera.context;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = computeColor(this.color, 0.75);
        context.stroke();
        context.beginPath();
        context.moveTo(this.position.x, this.position.y);
        context.lineTo(this.position.x + this.direction.x * this.radius, 
                       this.position.y + this.direction.y * this.radius);
        context.stroke();
    }

    walkTo(x, y) {      
        const a = this.level.getNode(Math.floor(x / Level.TILE_SIZE), Math.floor(y / Level.TILE_SIZE));
        const b = this.level.getNode(Math.floor(this.position.x / Level.TILE_SIZE), Math.floor(this.position.y / Level.TILE_SIZE));
        const route = this.aStar.route(a, b, true);
        if(route && route.length > 0) {
            this.walkRoute(route);
            return true;
        }
        return false;
    }

    walkRoute(route) {
        this.currentIndex = 0;
        this.route = route;
        this.destination = null;
    }

    update(dt) {

        if(Math.floor(this.position.x / Level.TILE_SIZE) != this.lastPosition.x 
        || Math.floor(this.position.y / Level.TILE_SIZE) != this.lastPosition.y) {
            this.lastPosition.set(this.position).scl(1.0 / Level.TILE_SIZE).floor();
            this.needUpdate = true;
        } else {
            this.needUpdate = false;
        }
        
        if(this.route) {

            if(!this.destination || this.destination.dst(this.position) < this.threshold) {

                if(this.currentIndex == this.route.length) {
                    this.route = null; // end
                } else {
                    let tmp = this.route[this.currentIndex++];
                    this.destination = new Vec2(tmp.x * Level.TILE_SIZE + Level.TILE_SIZE * 0.5, tmp.y * Level.TILE_SIZE + Level.TILE_SIZE * 0.5); // next step
                }

            } else {
                // Move Entity
                moveTo(this.position, this.destination, dt * this.speed, this.direction);
            }

        } else {
            this.onMissRoute();
        }

    }

    onMissRoute() {};

    overlaps(e) {
        let dx = this.position.x - e.position.x;
		let dy = this.position.y - e.position.y;
		let distance = dx * dx + dy * dy;
		let radiusSum = this.radius + e.radius;
		return distance < radiusSum * radiusSum;
    }

    computeViewPoints(angle = 0.5, distance = 200) {
        let result = [];
        for(let r = -angle; r <= angle; r += 0.05) {
            let d = new Vec2(this.direction).rotate(r);
            let hit = this.level.ray(this.position, d, distance);
            if(hit) {
                result.push(hit);               
            }
        }
        return result;
    }
    
}