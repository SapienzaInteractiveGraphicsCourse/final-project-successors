
/**
 * 
 * 
 * CHECKING FOR COLLISIONS 
 * 
 */

function objCollided() {
    if (objTouchedtoAnother(car.collidable, collidableFuels)) {
        endLevel();
    }
}

function objTouchedtoAnother(obj, objList) { // TODO: annotate
    o = getParameters(obj);
    for (let target of objList) {
        t = getParameters(target);
        if ((Math.abs(o.x - t.x) * 2 < t.w + o.w) && (Math.abs(o.y - t.y) * 2 < t.h + o.h)) {
            return true;
        }
    }
    return false;
}

function getParameters(obj) {  // TODO: annotate
    var p = obj.geometry.parameters;
    var globalPos = new THREE.Vector3(0., 0., 0.);
    obj.getWorldPosition(globalPos);
    var x = globalPos.x;
    var y = globalPos.z;
    var w = p.width;
    if (p.hasOwnProperty('radiusBottom')) {
        w = Math.max(p.radiusTop, p.radiusBottom); 
    }
    var h = p.height;
    return { 'x': x, 'y': y, 'w': w, 'h': h };
}


/**
 * 
 * increasing and decreasing heights
 * 
 */
function increaseHeight(obj, duration, dy, scale) { 
    obj.animforObjGrowth_isGrowing = true;
    obj.animforObjGrowth_end_time = duration;
    obj.animforObjGrowth_end_dy = dy;
    obj.animforObjGrowth_end_scale = scale;
    obj.animforObjGrowth_start_y = obj.position.y - dy;
    obj.animforObjGrowth_time = 0;
}

function decreaseHeight(obj, duration, dy, scale) {
    obj.animforObjShrink_isShrinking = true;
    obj.animforObjShrink_start_time = duration;
    obj.animforObjShrink_time = duration;
    obj.animforObjShrink_start_scale = scale;
    obj.animforObjShrink_end_dy = dy;
    obj.animforObjShrink_start_y = obj.position.y;
}

function animationforObjGrowth() {
    var progress, x, y, z, scale;
    for (let child of scene.children) {
        if (child.animforObjGrowth_isGrowing) {
            child.animforObjGrowth_time++;

            progress = child.animforObjGrowth_time / child.animforObjGrowth_end_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animforObjGrowth_start_y + (progress * child.animforObjGrowth_end_dy);
            child.position.set(x, y, z);

            scale = child.animforObjGrowth_end_scale * progress;
            child.scale.set(scale, scale, scale);

            if (child.animforObjGrowth_time >= child.animforObjGrowth_end_time) {
                child.animforObjGrowth_isGrowing = false;
            }
        }
    }
}

function animationforObjShrink() {
    var scale, progress;
    for (let child of scene.children) {
        if (child.animforObjShrink_isShrinking) {
            child.animforObjShrink_time--;

            progress = child.animforObjShrink_time / child.animforObjShrink_start_time;

            x = child.position.x;
            z = child.position.z;
            y = child.animforObjShrink_start_y + (progress * child.animforObjShrink_end_dy);
            child.position.set(x, y, z);

            scale = progress * child.animforObjShrink_start_scale;
            child.scale.set(scale, scale, scale);

            if (child.animforObjShrink_time <= 0) {
                scene.remove(child);
                child.animforObjShrink_isShrinking = false;
            }
        }
    }
}