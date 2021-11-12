/**
 * 2021 - Sergio Soriano
 * https://github.com/sergiss
 * www.sergiosoriano.com
 */
 const LATERAL_WEIGHT = 1;
 const DIAGONAL_WEIGHT = Math.sqrt(2) * LATERAL_WEIGHT;
 
 class AStar {
 
   constructor(grid, heuristic = new ManhattanDistance()) {
     this.grid = grid;
     this.heuristic = heuristic;
     this.openSet = new PriorityQueue();
   }
 
   route(a, b, simplified) {

     if(a.isObstacle() || b.isObstacle()) return null;
 
     this.closedSet = [];
     this.openSet.clear();
 
     a.g = 0;
     a.h = this.heuristic.compute(a, b);
     a.f = a.g + a.h;
 
     this.openSet.add(a);
 
     let x1, x2, y1, y2, i, j, node, neighbor;
     do {
       node = this.openSet.poll();
 
       if (node === b) { // check target       
         return this.backTrace(a, b, simplified);
       }
 
       // Neighbor position ranges
       x1 = Math.max(0, node.x - 1);
       x2 = Math.min(node.x + 2, this.grid.getCols());
 
       y1 = Math.max(0, node.y - 1);
       y2 = Math.min(node.y + 2, this.grid.getRows());
       // Iterate neighbors
       for (i = x1; i < x2; ++i) {
         for (j = y1; j < y2; ++j) {
           
           if (i !== node.x || j !== node.y) { // if not the same
             neighbor = this.grid.getNode(i, j);
 
             if (!neighbor.isObstacle() && 
                 !this.closedSet[neighbor.id] &&
                 !this.grid.getNode(node.x, j).isObstacle() && 
                 !this.grid.getNode(i, node.y).isObstacle()) { // check if node it is visitable
               
               const weight = node.x === i || node.y === j ? LATERAL_WEIGHT : DIAGONAL_WEIGHT;
               const g = node.g + weight;                     // Actual cost up to node n.
               const h = this.heuristic.compute(neighbor, b); // Estimated cost to goal.
               const f = g + h;                               // Estimated cost of the solution through n.
 
               if (neighbor.f > f) { // Update neighbor
                 neighbor.g = g;
                 neighbor.h = h;
                 neighbor.f = f;
                 neighbor.parent = node;  
                 this.openSet.remove(neighbor); 
                 this.openSet.add(neighbor);
               } else if (!this.openSet.contains(neighbor)) { // Add neighbor
                 neighbor.g = g;
                 neighbor.h = h;
                 neighbor.f = f;
                 neighbor.parent = node;            
                 this.openSet.add(neighbor);
               }
             }
             
           }
          
         }
       }
       this.closedSet[node.id] = node; // Add node to closedSet
     } while (this.openSet.size() > 0);
 
     return null;
   }
 
   backTrace(a, b, simplified = false) {
 
     let route = [];
     let lastNode; 
 
     if(simplified) {
       let nX = 0, nY = 0; // normal
       while (b != a) {
         lastNode = b; // lastNode
         b = b.parent; // currentNode
         let x = b.x - lastNode.x, 
             y = b.y - lastNode.y;
         if (x != nX || y != nY) {
           nX = x;
           nY = y;
           route.push(lastNode);
         }
       }
     } else {
       while (b != a) {
         lastNode = b; // lastNode
         b = b.parent; // currentNode
         route.push(lastNode);
       }
     }
     route.push(a);
     return route;
   }
 
 }
 
 class PriorityQueue {
 
   constructor() {
     this.data = [];
   }
 
   add(value) {
     let i = 0;
     for(i = 0; i < this.data.length; ++i) {
         if(this.data[i].compare(value) > 0) {
             break;
         }
     }
     this.data.splice(i, 0, value);
   }
 
   contains(value) {
     return this.indexOf(value) > -1;
   }
 
   indexOf(value) {
     for(let i = 0; i < this.data.length; ++i) {
         if(this.data[i] === value) return i;
     }
     return -1;
   }
 
   poll() {
     return this.data.splice(0, 1)[0];
   }
 
   remove(value) {
     let index = this.indexOf(value);
     if(index > -1) {
         this.data.splice(index, 1);
         return true;
     }
     return false;
   }
 
   clear() {
     this.data = [];
   }
 
   size() {
     return this.data.length;
   }
 }
 
 class Node {
 
   constructor(x, y, obstacle = false) {
     this.id = `${x},${y}`;
     this.x = x;
     this.y = y;
 
     this.obstacle = obstacle;
 
     this.f = 0; // Estimated cost of the solution through n.
     this.g = 0; // Actual cost up to node n.
     this.h = 0; // Estimated cost to goal.
   }

   isObstacle() {
     return this.obstacle;
   }
 
   compare(o) { // PriorityQueue
     if (this.f < o.f) return -1;
     if (this.f > o.f) return 1;
     return this.h < o.h ? -1 : this.h === o.h ? 0 : 1;
   }
 }
 
 class Grid {
   getCols() {
     throw new Error("Unimplemented method.");
   }
   getRows() {
     throw new Error("Unimplemented method.");
   }
   getNode(x, y) {
     throw new Error("Unimplemented method.");
   }
 }
 
 class Heuristic {
   compute(a, b) {
     throw new Error("Unimplemented method.");
   }
 }
 
 class ManhattanDistance extends Heuristic {
     compute(a, b) {
         return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * LATERAL_WEIGHT;
     }	
 }

 export { Grid, Node, AStar };
 