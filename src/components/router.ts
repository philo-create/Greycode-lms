export type Point = { x: number, y: number };
export type Obstacle = { x: number, y: number, width: number, height: number, id: string, componentType?: string };
export type WireInfo = { id: string, waypoints?: Point[] };

const COMPONENT_PADDING = 16;
const BOARD_PADDING = 20;
const WIRE_LANE_SPACING = 18;
const STUB_LENGTH = 24;

function getPad(o: Obstacle) {
  if (o.id.includes('board') || o.componentType === 'esp32' || o.componentType === 'breadboard') return BOARD_PADDING;
  return COMPONENT_PADDING;
}

export function routeWireManhattan(
  startX: number, startY: number, endX: number, endY: number,
  startDir: string = 'auto', endDir: string = 'auto',
  obstacles: Obstacle[] = [],
  startBoardId?: string,
  endBoardId?: string,
  wireId: string = '',
  existingWires: WireInfo[] = []
): Point[] {
  
  const getStartObj = () => obstacles.find(o => o.id === startBoardId) || obstacles.find(o => (startX >= o.x - COMPONENT_PADDING && startX <= o.x + o.width + COMPONENT_PADDING && startY >= o.y - COMPONENT_PADDING && startY <= o.y + o.height + COMPONENT_PADDING));
  const getEndObj = () => obstacles.find(o => o.id === endBoardId) || obstacles.find(o => (endX >= o.x - COMPONENT_PADDING && endX <= o.x + o.width + COMPONENT_PADDING && endY >= o.y - COMPONENT_PADDING && endY <= o.y + o.height + COMPONENT_PADDING));
  
  const startObj = getStartObj();
  const endObj = getEndObj();

  if (startDir === 'auto' && startObj) {
     const dLeft = Math.abs(startX - startObj.x);
     const dRight = Math.abs(startX - (startObj.x + startObj.width));
     const dTop = Math.abs(startY - startObj.y);
     const dBot = Math.abs(startY - (startObj.y + startObj.height));
     const m = Math.min(dLeft, dRight, dTop, dBot);
     if (m === dLeft) startDir = 'left';
     else if (m === dRight) startDir = 'right';
     else if (m === dTop) startDir = 'top';
     else startDir = 'bottom';
  }
  if (endDir === 'auto' && endObj) {
     const dLeft = Math.abs(endX - endObj.x);
     const dRight = Math.abs(endX - (endObj.x + endObj.width));
     const dTop = Math.abs(endY - endObj.y);
     const dBot = Math.abs(endY - (endObj.y + endObj.height));
     const m = Math.min(dLeft, dRight, dTop, dBot);
     if (m === dLeft) endDir = 'left';
     else if (m === dRight) endDir = 'right';
     else if (m === dTop) endDir = 'top';
     else endDir = 'bottom';
  }
  
  let p1x = startX, p1y = startY;
  if (startDir === 'left') p1x = startObj ? startObj.x - getPad(startObj) - 4 : startX - STUB_LENGTH;
  else if (startDir === 'right') p1x = startObj ? startObj.x + startObj.width + getPad(startObj) + 4 : startX + STUB_LENGTH;
  else if (startDir === 'top') p1y = startObj ? startObj.y - getPad(startObj) - 4 : startY - STUB_LENGTH;
  else if (startDir === 'bottom') p1y = startObj ? startObj.y + startObj.height + getPad(startObj) + 4 : startY + STUB_LENGTH;
  
  let p2x = endX, p2y = endY;
  if (endDir === 'left') p2x = endObj ? endObj.x - getPad(endObj) - 4 : endX - STUB_LENGTH;
  else if (endDir === 'right') p2x = endObj ? endObj.x + endObj.width + getPad(endObj) + 4 : endX + STUB_LENGTH;
  else if (endDir === 'top') p2y = endObj ? endObj.y - getPad(endObj) - 4 : endY - STUB_LENGTH;
  else if (endDir === 'bottom') p2y = endObj ? endObj.y + endObj.height + getPad(endObj) + 4 : endY + STUB_LENGTH;

  const startPt = { x: startX, y: startY };
  const endPt = { x: endX, y: endY };
  const startStub = { x: p1x, y: p1y };
  const endStub = { x: p2x, y: p2y };

  const direct = tryDirectRoute(startPt, endPt, startStub, endStub, obstacles, startObj, endObj);
  if (isValidRoute(direct, obstacles, existingWires, startObj, endObj, wireId)) return cleanPath(direct);

  const elbow = trySimpleElbowRoute(startPt, endPt, startStub, endStub, obstacles, startObj, endObj);
  if (isValidRoute(elbow, obstacles, existingWires, startObj, endObj, wireId)) return cleanPath(elbow);

  const laneRoute = tryLaneOffsetRoute(startPt, endPt, startStub, endStub, obstacles, existingWires, startObj, endObj, wireId);
  if (isValidRoute(laneRoute, obstacles, existingWires, startObj, endObj, wireId)) return cleanPath(laneRoute);

  const astar = tryAStarRoute(startPt, endPt, startStub, endStub, obstacles, startObj, endObj, existingWires, wireId);
  if (isValidRoute(astar, obstacles, existingWires, startObj, endObj, wireId)) return cleanPath(astar);
  
  // If A* route is geometrically safe from obstacles, accept it even if it overlaps wires 
  // (prefer overlapping a wire over crossing through a component body)
  if (astar && astar.length > 0 && !hasDiagonalSegments(astar) && !intersectsObstacles(astar, obstacles, startObj, endObj)) {
    return cleanPath(astar);
  }

  return cleanPath(createSafeFallbackRoute(startPt, endPt, startStub, endStub));
}

function tryDirectRoute(start: Point, end: Point, startStub: Point, endStub: Point, obstacles: Obstacle[], startObj?: Obstacle, endObj?: Obstacle): Point[] {
  return [start, startStub, endStub, end];
}

function trySimpleElbowRoute(start: Point, end: Point, startStub: Point, endStub: Point, obstacles: Obstacle[], startObj?: Obstacle, endObj?: Obstacle): Point[] {
  // Try X then Y
  const route1 = [start, startStub, { x: endStub.x, y: startStub.y }, endStub, end];
  if (!intersectsObstacles(route1, obstacles, startObj, endObj)) return route1;
  
  // Try Y then X
  const route2 = [start, startStub, { x: startStub.x, y: endStub.y }, endStub, end];
  return route2;
}

function tryLaneOffsetRoute(start: Point, end: Point, startStub: Point, endStub: Point, obstacles: Obstacle[], existingWires: WireInfo[], startObj?: Obstacle, endObj?: Obstacle, currentWireId?: string): Point[] {
  // Generate some lane offsets
  for (let offset = WIRE_LANE_SPACING; offset <= WIRE_LANE_SPACING * 3; offset += WIRE_LANE_SPACING) {
    for (const sign of [1, -1]) {
      const shift = offset * sign;
      
      const routeX = [start, startStub, { x: endStub.x + shift, y: startStub.y }, { x: endStub.x + shift, y: endStub.y }, endStub, end];
      if (isValidRoute(routeX, obstacles, existingWires, startObj, endObj, currentWireId)) return routeX;
      
      const routeY = [start, startStub, { x: startStub.x, y: endStub.y + shift }, { x: endStub.x, y: endStub.y + shift }, endStub, end];
      if (isValidRoute(routeY, obstacles, existingWires, startObj, endObj, currentWireId)) return routeY;
    }
  }
  return [];
}

function createSafeFallbackRoute(start: Point, end: Point, startStub: Point, endStub: Point): Point[] {
  return [start, startStub, { x: startStub.x, y: endStub.y }, endStub, end];
}

function intersectsObstacles(route: Point[], obstacles: Obstacle[], startObj?: Obstacle, endObj?: Obstacle): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i];
    const p2 = route[i+1];
    
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    
    const isStartStubSegment = (i === 0);
    const isEndStubSegment = (i === route.length - 2);
    
    for (const o of obstacles) {
      const isStart = o.id === startObj?.id;
      const isEnd = o.id === endObj?.id;
      
      // Allow the start stub to cross the start object, and end stub to cross the end object
      if (isStart && isStartStubSegment) continue;
      if (isEnd && isEndStubSegment) continue;

      const currentPad = getPad(o);
      
      const ox1 = o.x - currentPad;
      const ox2 = o.x + o.width + currentPad;
      const oy1 = o.y - currentPad;
      const oy2 = o.y + o.height + currentPad;
      
      if (maxX > ox1 && minX < ox2 && maxY > oy1 && minY < oy2) {
        return true;
      }
    }
  }
  return false;
}

function hasDiagonalSegments(route: Point[]): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    if (route[i].x !== route[i+1].x && route[i].y !== route[i+1].y) {
      return true;
    }
  }
  return false;
}

function hasHugeUnnecessaryLoop(route: Point[]): boolean {
  let totalLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalLength += Math.abs(route[i].x - route[i+1].x) + Math.abs(route[i].y - route[i+1].y);
  }
  const directDistance = Math.abs(route[0].x - route[route.length - 1].x) + Math.abs(route[0].y - route[route.length - 1].y);
  return totalLength > directDistance * 5 + 1000;
}

function overlapsExistingWire(route: Point[], existingWires: WireInfo[], currentWireId?: string): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    const r1 = route[i];
    const r2 = route[i+1];
    const isHorizontal = r1.y === r2.y;
    const isVertical = r1.x === r2.x;
    
    for (const wire of existingWires) {
      if (wire.id === currentWireId || !wire.waypoints) continue;
      
      for (let j = 0; j < wire.waypoints.length - 1; j++) {
        const w1 = wire.waypoints[j];
        const w2 = wire.waypoints[j+1];
        
        if (isHorizontal && w1.y === w2.y && Math.abs(r1.y - w1.y) < 5) {
          const minRX = Math.min(r1.x, r2.x);
          const maxRX = Math.max(r1.x, r2.x);
          const minWX = Math.min(w1.x, w2.x);
          const maxWX = Math.max(w1.x, w2.x);
          if (maxRX > minWX && minRX < maxWX) return true; // overlap
        }
        
        if (isVertical && w1.x === w2.x && Math.abs(r1.x - w1.x) < 5) {
          const minRY = Math.min(r1.y, r2.y);
          const maxRY = Math.max(r1.y, r2.y);
          const minWY = Math.min(w1.y, w2.y);
          const maxWY = Math.max(w1.y, w2.y);
          if (maxRY > minWY && minRY < maxWY) return true; // overlap
        }
      }
    }
  }
  return false;
}

function isValidRoute(route: Point[], obstacles: Obstacle[], existingWires: WireInfo[], startObj?: Obstacle, endObj?: Obstacle, currentWireId?: string): boolean {
  if (!route || route.length < 2) return false;
  if (hasDiagonalSegments(route)) return false;
  if (intersectsObstacles(route, obstacles, startObj, endObj)) return false;
  if (hasHugeUnnecessaryLoop(route)) return false;
  if (overlapsExistingWire(route, existingWires, currentWireId)) return false;
  return true;
}

function cleanPath(path: Point[]): Point[] {
  if (!path || path.length === 0) return [];
  const clean = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = clean[clean.length - 1];
    const curr = path[i];
    const next = path[i+1];
    if ((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y)) {
      continue;
    }
    clean.push(curr);
  }
  if (path.length > 1) {
      const last = path[path.length - 1];
      const prev = clean[clean.length - 1];
      if (last.x !== prev.x || last.y !== prev.y) {
          clean.push(last);
      }
  }
  return clean;
}

function tryAStarRoute(start: Point, end: Point, startStub: Point, endStub: Point, obstacles: Obstacle[], startObj?: Obstacle, endObj?: Obstacle, existingWires: WireInfo[] = [], currentWireId: string = ''): Point[] {
  const xs = new Set<number>([start.x, startStub.x, end.x, endStub.x]);
  const ys = new Set<number>([start.y, startStub.y, end.y, endStub.y]);
  
  obstacles.forEach(o => {
    const currentPad = getPad(o);
    xs.add(o.x - currentPad); xs.add(o.x + o.width + currentPad);
    ys.add(o.y - currentPad); ys.add(o.y + o.height + currentPad);
  });
  
  const minWsX = Math.min(...Array.from(xs)) - 50;
  const maxWsX = Math.max(...Array.from(xs)) + 50;
  const minWsY = Math.min(...Array.from(ys)) - 50;
  const maxWsY = Math.max(...Array.from(ys)) + 50;
  
  xs.add(minWsX); xs.add(maxWsX);
  ys.add(minWsY); ys.add(maxWsY);
  
  // Add some extra grid lines near the board for lanes
  if (startObj) {
    const pad = getPad(startObj);
    for (let l = 1; l <= 3; l++) {
      xs.add(startObj.x - pad - (WIRE_LANE_SPACING * l));
      xs.add(startObj.x + startObj.width + pad + (WIRE_LANE_SPACING * l));
      ys.add(startObj.y - pad - (WIRE_LANE_SPACING * l));
      ys.add(startObj.y + startObj.height + pad + (WIRE_LANE_SPACING * l));
    }
  }
  if (endObj) {
    const pad = getPad(endObj);
    for (let l = 1; l <= 3; l++) {
      xs.add(endObj.x - pad - (WIRE_LANE_SPACING * l));
      xs.add(endObj.x + endObj.width + pad + (WIRE_LANE_SPACING * l));
      ys.add(endObj.y - pad - (WIRE_LANE_SPACING * l));
      ys.add(endObj.y + endObj.height + pad + (WIRE_LANE_SPACING * l));
    }
  }
  
  const xArr = Array.from(xs).sort((a, b) => a - b);
  const yArr = Array.from(ys).sort((a, b) => a - b);
  
  const snap = (val: number, arr: number[]) => {
    let closest = arr[0];
    for (const v of arr) if (Math.abs(v - val) < Math.abs(closest - val)) closest = v;
    return arr.indexOf(closest);
  };
  
  const startIX = snap(startStub.x, xArr), startIY = snap(startStub.y, yArr);
  const endIX = snap(endStub.x, xArr), endIY = snap(endStub.y, yArr);
  
  const isSegmentValid = (ix1: number, iy1: number, ix2: number, iy2: number) => {
    const minX = Math.min(xArr[ix1], xArr[ix2]);
    const maxX = Math.max(xArr[ix1], xArr[ix2]);
    const minY = Math.min(yArr[iy1], yArr[iy2]);
    const maxY = Math.max(yArr[iy1], yArr[iy2]);
    
    for (const o of obstacles) {
      const currentPad = getPad(o);
      
      const ox1 = o.x - currentPad + 1;
      const ox2 = o.x + o.width + currentPad - 1;
      const oy1 = o.y - currentPad + 1;
      const oy2 = o.y + o.height + currentPad - 1;
      
      if (maxX >= ox1 && minX <= ox2 && maxY >= oy1 && minY <= oy2) {
        return false;
      }
    }
    return true;
  };

  const getOverlapPenalty = (ix1: number, iy1: number, ix2: number, iy2: number): number => {
    const p1 = { x: xArr[ix1], y: yArr[iy1] };
    const p2 = { x: xArr[ix2], y: yArr[iy2] };
    if (overlapsExistingWire([p1, p2], existingWires, currentWireId)) {
       return 5000; // heavy penalty for overlapping
    }
    return 0;
  };
  
  const open: {x: number, y: number, g: number, h: number, parent: any}[] = [];
  const closed = new Set<string>();
  
  open.push({x: startIX, y: startIY, g: 0, h: Math.abs(startIX - endIX) + Math.abs(startIY - endIY), parent: null});
  
  let targetNode = null;
  let iters = 0;
  while (open.length > 0 && iters < 5000) {
    iters++;
    open.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    const curr = open.shift()!;
    const key = `${curr.x},${curr.y}`;
    
    if (closed.has(key)) continue;
    closed.add(key);
    
    if (curr.x === endIX && curr.y === endIY) {
      targetNode = curr;
      break;
    }
    
    const neighbors = [
      {x: curr.x + 1, y: curr.y},
      {x: curr.x - 1, y: curr.y},
      {x: curr.x, y: curr.y + 1},
      {x: curr.x, y: curr.y - 1}
    ];
    
    for (const n of neighbors) {
      if (n.x >= 0 && n.x < xArr.length && n.y >= 0 && n.y < yArr.length) {
        if (!closed.has(`${n.x},${n.y}`)) {
          if (isSegmentValid(curr.x, curr.y, n.x, n.y)) {
             const dist = Math.abs(xArr[n.x] - xArr[curr.x]) + Math.abs(yArr[n.y] - yArr[curr.y]);
             let cost = curr.g + dist;
             cost += getOverlapPenalty(curr.x, curr.y, n.x, n.y);
             if (curr.parent && curr.x !== n.x && curr.y !== n.y) cost += 10;
             open.push({
               x: n.x, y: n.y,
               g: cost,
               h: Math.abs(xArr[n.x] - xArr[endIX]) + Math.abs(yArr[n.y] - yArr[endIY]),
               parent: curr
             });
          }
        }
      }
    }
  }
  
  const path = [{x: end.x, y: end.y}];
  if (targetNode) {
    let curr = targetNode;
    while (curr) {
      path.unshift({x: xArr[curr.x], y: yArr[curr.y]});
      curr = curr.parent;
    }
  } else {
    path.unshift({x: endStub.x, y: endStub.y});
    path.unshift({x: startStub.x, y: startStub.y});
  }
  path.unshift({x: start.x, y: start.y});
  return path;
}


