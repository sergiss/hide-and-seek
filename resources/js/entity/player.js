import { Vec2 } from "../vec2.js";
import { PointLight } from "./point-light.js";

export class Player extends PointLight {

    constructor(x, y, level) {
        super(x, y, level);
        super.color = '#00AFF0'

        this.light = 0;
        this.speed = 10;
    }

    update(dt) {
        super.update(dt);

        if(this.light < 1) {
            this.light += dt * 0.025;
            if(this.light > 1) {
                this.light = 1;
            }
        }

    }

}