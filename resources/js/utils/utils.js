import { Vec2 } from "../vec2.js";

function moveTo(a, b, step, direction) {
    let x = b.x - a.x;
    let y = b.y - a.y;

    let len = x * x + y * y;
    if(len != 0) {
        len = Math.sqrt(len);
        x /= len;
        y /= len;
    }

    if(step > len) {
        step = len;
    }
    a.add(x * step, y * step);
    if(direction) direction.set(x, y);
}

function interpolate(a, b, step) {
    return a + (b - a) * step;
}

function computeColor(color, f) {
    const compute = (c, f) => Math.floor(Math.min(parseInt(c, 16) * f, 255)).toString(16).padStart(2, '0');
    const b = compute(color.substring(color.length - 2, color.length - 0), f);
    const g = compute(color.substring(color.length - 4, color.length - 2), f);
    const r = compute(color.substring(color.length - 6, color.length - 4), f);
    return `${(color.charAt(0) === '#') ? '#' : ''}${r}${g}${b}`;
}


function polygonContains(vertices, x, y) {
    
    if (x instanceof Vec2) {
      y = x.y;
      x = x.x;
    }

    let intersects = 0;
    for (let v1, v2, i = 0; i < vertices.length; ++i) {
      v1 = vertices[i];
      v2 = vertices[(i + 1) % vertices.length];
      if (
        ((v1.y <= y && y < v2.y) || (v2.y <= y && y < v1.y)) &&
        x < ((v2.x - v1.x) / (v2.y - v1.y)) * (y - v1.y) + v1.x
      )
        intersects++;
    }

    return (intersects & 1) == 1;
}

function intersectSegmentCircle (p1, p2, center, squareRadius) {
    let tmp = new Vec2(p2).sub(p1);
    let l = tmp.len();
    if(l !== 0) tmp.scl(1.0 / l);
    let u = tmp.dot(center.x - p1.x, center.y - p1.y);
    if (u <= 0) {
        tmp.set(p1);
    } else if (u >= l) {
        tmp.set(p2);
    } else {
        tmp.scl(u).add(p1);
    }

    let x = center.x - tmp.x;
    let y = center.y - tmp.y;

    return x * x + y * y <= squareRadius;
}

function renderPolygon(context, viewPoints, fillStyle, alpha = 1) {
    if(viewPoints && viewPoints.length > 2) {
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = fillStyle;
        context.beginPath();
        const startPoint = viewPoints[0];
        context.moveTo(startPoint.x, startPoint.y);
        for(let i = 1; i < viewPoints.length; ++i) {
            let p = viewPoints[i];
            context.lineTo(p.x,p.y);
        }
        context.lineTo(startPoint.x, startPoint.y);
        context.closePath();
        context.fill();
        context.restore();
      }
}

export {moveTo, interpolate, computeColor, intersectSegmentCircle, renderPolygon};