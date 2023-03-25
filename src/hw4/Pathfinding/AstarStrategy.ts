import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system.
 *
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {
  /**
   * @see NavPathStrat.buildPath()
   */
  public buildPath(to: Vec2, from: Vec2): NavigationPath {
    let openSet: Vec2[] = [from];
    let closedSet: Vec2[] = [];

    let parentMap: Map<string, Vec2> = new Map();
    let gScore: Map<string, number> = new Map();
    let fScore: Map<string, number> = new Map();
    let fromString = from.toString();
    gScore.set(fromString, 0);
    fScore.set(fromString, from.distanceTo(to));
    //let stack = new Stack<Vec2>(2000);
    //let closestest = from;
    while (openSet.length > 0) {
      // Get the node with the lowest f score
      let current = openSet.reduce((a, b) =>
        fScore.get(a.toString())! < fScore.get(b.toString())! ? a : b
      );
      //console.log("current test" + current.x + "," + current.y);
      if (
        current.x > to.x - 4 &&
        current.x < to.x + 4 &&
        current.y > to.y - 4 &&
        current.y < to.y + 4
      ) {
        //console.log("found path at" + current.x + "," + current.y);
        return this.reconstructPath(parentMap, current, to);
      }
      openSet = openSet.filter((n) => !n.equals(current));
      closedSet.push(current);

      let neighbors = this.getNeighbors(current);
      //if (current.x > 400 && current.y < 50)
      //if (closestest.distanceSqTo(to) > current.distanceSqTo(to))
      //  closestest = current;
      neighbors = neighbors.filter((n) => !closedSet.some((c) => c.equals(n)));

      if (neighbors.length > 1) {
        for (let neighbor of neighbors) {
          let neighborKey = neighbor.toString();
          let tempGScore =
            gScore.get(current.toString())! + current.distanceTo(neighbor);

          if (!openSet.some((n) => n.equals(neighbor))) {
            openSet.push(neighbor);
          } else if (
            gScore.has(neighborKey) &&
            tempGScore >= gScore.get(neighborKey)
          ) {
            continue;
          }

          parentMap.set(neighborKey, current);
          gScore.set(neighborKey, tempGScore);
          fScore.set(neighborKey, tempGScore + neighbor.distanceTo(to));
        }
      }
    }
    return new NavigationPath(new Stack());
  }

  private reconstructPath(
    cameFrom: Map<String, Vec2>,
    end: Vec2,
    to: Vec2
  ): NavigationPath {
    const path = new Stack<Vec2>(this.mesh.graph.numVertices);
    path.push(to.clone());
    path.push(end);

    let current = end;
    let temp = current;
    while (cameFrom.has(current.toString())) {
      current = cameFrom.get(current.toString());
      cameFrom.delete(temp.toString());
      temp = current;
      path.push(current);
    }

    return new NavigationPath(path);
  }

  private getNeighbors(position: Vec2): Array<Vec2> {
    let neighbors: Array<Vec2> = new Array<Vec2>();

    let edge = this.mesh.graph.edges[this.mesh.graph.snap(position)];

    while (edge) {
      neighbors.push(this.mesh.graph.getNodePosition(edge.y));
      edge = edge.next;
    }
    return neighbors.length > 1 ? neighbors : [];
  }
}
