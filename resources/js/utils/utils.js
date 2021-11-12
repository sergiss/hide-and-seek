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

export {moveTo, interpolate, computeColor};