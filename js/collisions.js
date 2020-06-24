
function checkCollisions() {

    // mark victory and advance level
    if (objectInBound(car.collidable, collidableFuels)) {
        endLevel();
    }
}

function objectInBound(object, objectList) { // TODO: annotate
    o = get_xywh(object);
    for (let target of objectList) {
        t = get_xywh(target);
        if ((Math.abs(o.x - t.x) * 2 < t.w + o.w) && (Math.abs(o.y - t.y) * 2 < t.h + o.h)) {
            return true;
        }
    }
    return false;
}

function get_xywh(object) {  // TODO: annotate
    var p = object.geometry.parameters;
    var globalPosition = new THREE.Vector3(0., 0., 0.);
    object.getWorldPosition(globalPosition);
    var x = globalPosition.x;
    var y = globalPosition.z;
    var w = p.width;
    if (p.hasOwnProperty('radiusBottom')) {
        w = Math.max(p.radiusTop, p.radiusBottom); 
    }
    var h = p.height;
    return { 'x': x, 'y': y, 'w': w, 'h': h };
}



function startGrowth(object, duration, dy, scale) { 
    object.animateGrow_isGrowing = true;
    object.animateGrow_end_time = duration;
    object.animateGrow_end_dy = dy;
    object.animateGrow_end_scale = scale;
    object.animateGrow_start_y = object.position.y - dy;
    object.animateGrow_time = 0;
}

function startShrink(object, duration, dy, scale) {
    object.animateShrink_isShrinking = true;
    object.animateShrink_start_time = duration;
    object.animateShrink_time = duration;
    object.animateShrink_start_scale = scale;
    object.animateShrink_end_dy = dy;
    object.animateShrink_start_y = object.position.y;
}

function animateGrow() {
    var progress, x, y, z, scale;
    for (let child of scene.children) {
        if (child.animateGrow_isGrowing) {
            child.animateGrow_time++;

            progress = child.animateGrow_time / child.animateGrow_end_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animateGrow_start_y + (progress * child.animateGrow_end_dy);
            child.position.set(x, y, z);

            scale = child.animateGrow_end_scale * progress;
            child.scale.set(scale, scale, scale);

            if (child.animateGrow_time >= child.animateGrow_end_time) {
                child.animateGrow_isGrowing = false;
            }
        }
    }
}

function animateShrink() {
    var scale, progress;
    for (let child of scene.children) {
        if (child.animateShrink_isShrinking) {
            child.animateShrink_time--;

            progress = child.animateShrink_time / child.animateShrink_start_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animateShrink_start_y + (progress * child.animateShrink_end_dy);
            child.position.set(x, y, z);

            scale = progress * child.animateShrink_start_scale;
            child.scale.set(scale, scale, scale);

            if (child.animateShrink_time <= 0) {
                scene.remove(child);
                child.animateShrink_isShrinking = false;
            }
        }
    }
}