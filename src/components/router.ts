export function routeWireManhattan(
  startX: number, startY: number, endX: number, endY: number,
  startDir: string = 'auto', endDir: string = 'auto',
  obstacles: {x: number, y: number, width: number, height: number, id: string}[] = [],
  startBoardId?: string,
  endBoardId?: string,
  wireId: string = ''
): {x: number, y: number}[] {
  let hashVal = 0;
  if (wireId) {
    for (let i = 0; i < wireId.length; i++) {
      hashVal = ((hashVal << 5) - hashVal) + wireId.charCodeAt(i);
      hashVal |= 0;
    }
    hashVal = Math.abs(hashVal);
  } else {
    hashVal = Math.floor(Math.abs(startX * 7 + startY * 11 + endX * 13 + endY * 17));
  }
  
  // Use stable hash to generate a pseudo-random stable offset for each wire
  // Ensure we use distinct channels spaced widely (at least 15-20 pixels apart) to prevent wires overlapping or running too close
  const wireLane = hashVal % 6;
  const hash = wireLane * 15;
  const pad = 24 + hash;
  const defaultStubLen = 35 + hash;
  
  // Determine if an obstacle contains the start or end point (using pad as hit radius so we don't get trapped in forbidden zones)
  const getStartObj = () => {
     let found = obstacles.find(o => o.id === startBoardId);
     if (found) return found;
     return obstacles.find(o => (startX >= o.x - pad && startX <= o.x + o.width + pad && startY >= o.y - pad && startY <= o.y + o.height + pad));
  };
  const getEndObj = () => {
     let found = obstacles.find(o => o.id === endBoardId);
     if (found) return found;
     return obstacles.find(o => (endX >= o.x - pad && endX <= o.x + o.width + pad && endY >= o.y - pad && endY <= o.y + o.height + pad));
  };
  
  const startObj = getStartObj();
  const endObj = getEndObj();

  // Determine smart directions if auto
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
  if (startDir === 'left') p1x = startObj ? startObj.x - pad : startX - defaultStubLen;
  else if (startDir === 'right') p1x = startObj ? startObj.x + startObj.width + pad : startX + defaultStubLen;
  else if (startDir === 'top') p1y = startObj ? startObj.y - pad : startY - defaultStubLen;
  else if (startDir === 'bottom') p1y = startObj ? startObj.y + startObj.height + pad : startY + defaultStubLen;
  
  let p2x = endX, p2y = endY;
  if (endDir === 'left') p2x = endObj ? endObj.x - pad : endX - defaultStubLen;
  else if (endDir === 'right') p2x = endObj ? endObj.x + endObj.width + pad : endX + defaultStubLen;
  else if (endDir === 'top') p2y = endObj ? endObj.y - pad : endY - defaultStubLen;
  else if (endDir === 'bottom') p2y = endObj ? endObj.y + endObj.height + pad : endY + defaultStubLen;

  const xs = new Set<number>([startX, p1x, endX, p2x]);
  const ys = new Set<number>([startY, p1y, endY, p2y]);
  
  const activeObstacles = obstacles; // we use all obstacles
  
  activeObstacles.forEach(o => {
    // If it's the start or end board, don't pad it as much, so the stub can exit.
    const isStart = o.id === startObj?.id;
    const isEnd = o.id === endObj?.id;
    const isStartOrEnd = isStart || isEnd;
    const currentPad = isStartOrEnd ? 2 + wireLane * 3 : pad;
    xs.add(o.x - currentPad); xs.add(o.x + o.width + currentPad);
    ys.add(o.y - currentPad); ys.add(o.y + o.height + currentPad);
  });
  
  // Workspace outer bounds dynamically
  const minWsX = Math.min(...Array.from(xs)) - 50;
  const maxWsX = Math.max(...Array.from(xs)) + 50;
  const minWsY = Math.min(...Array.from(ys)) - 50;
  const maxWsY = Math.max(...Array.from(ys)) + 50;
  
  xs.add(minWsX); xs.add(maxWsX);
  ys.add(minWsY); xs.add(maxWsY);
  
  const xArr = Array.from(xs).sort((a, b) => a - b);
  const yArr = Array.from(ys).sort((a, b) => a - b);
  
  // Snap points to closest grid
  const snap = (val: number, arr: number[]) => {
    let closest = arr[0];
    for (const v of arr) if (Math.abs(v - val) < Math.abs(closest - val)) closest = v;
    return arr.indexOf(closest);
  };
  
  const startIX = snap(p1x, xArr), startIY = snap(p1y, yArr);
  const endIX = snap(p2x, xArr), endIY = snap(p2y, yArr);
  
  const isSegmentValid = (ix1: number, iy1: number, ix2: number, iy2: number) => {
    const minX = Math.min(xArr[ix1], xArr[ix2]);
    const maxX = Math.max(xArr[ix1], xArr[ix2]);
    const minY = Math.min(yArr[iy1], yArr[iy2]);
    const maxY = Math.max(yArr[iy1], yArr[iy2]);
    
    const isStartStub = (minX >= Math.min(startX, p1x) && maxX <= Math.max(startX, p1x) &&
                         minY >= Math.min(startY, p1y) && maxY <= Math.max(startY, p1y));
    const isEndStub = (minX >= Math.min(endX, p2x) && maxX <= Math.max(endX, p2x) &&
                       minY >= Math.min(endY, p2y) && maxY <= Math.max(endY, p2y));
    
    for (const o of activeObstacles) {
      const isStart = o.id === startObj?.id;
      const isEnd = o.id === endObj?.id;
      const isStartOrEnd = isStart || isEnd;
      const currentPad = isStartOrEnd ? 2 + wireLane * 3 : pad;
      
      const ox1 = o.x - currentPad + 1;
      const ox2 = o.x + o.width + currentPad - 1;
      const oy1 = o.y - currentPad + 1;
      const oy2 = o.y + o.height + currentPad - 1;
      
      if (maxX > ox1 && minX < ox2 && maxY > oy1 && minY < oy2) {
         if (isStart && isStartStub) continue;
         if (isEnd && isEndStub) continue;
         return false;
      }
    }
    return true;
  };
  
  // A* search
  const open: {x: number, y: number, g: number, h: number, parent: any}[] = [];
  const closed = new Set<string>();
  
  open.push({x: startIX, y: startIY, g: 0, h: Math.abs(startIX - endIX) + Math.abs(startIY - endIY), parent: null});
  
  let targetNode = null;
  
  while (open.length > 0) {
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
             open.push({
               x: n.x, y: n.y,
               g: curr.g + dist,
               h: Math.abs(xArr[n.x] - xArr[endIX]) + Math.abs(yArr[n.y] - yArr[endIY]),
               parent: curr
             });
          }
        }
      }
    }
  }
  
  const path = [{x: endX, y: endY}];
  if (targetNode) {
    let curr = targetNode;
    while (curr) {
      path.unshift({x: xArr[curr.x], y: yArr[curr.y]});
      curr = curr.parent;
    }
  } else {
    // Fallback if no path
    path.unshift({x: p2x, y: p2y});
    path.unshift({x: p1x, y: p1y});
  }
  path.unshift({x: startX, y: startY});
  
  // Clean up collinear points
  const cleanPath = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = cleanPath[cleanPath.length - 1];
    const curr = path[i];
    const next = path[i+1];
    if ((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y)) {
      continue;
    }
    cleanPath.push(curr);
  }
  cleanPath.push(path[path.length - 1]);
  
  return cleanPath;
}
