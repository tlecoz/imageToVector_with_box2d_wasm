type Pt = { x: number, y: number };
type Triangle = { id, ids: number[], pts: Pt[], lines: string[], reverseLines: string[] };

export class TriangleListToPolygonList {

    public static convert(points: Pt[], indices: number[]) {

        const polygons = [];
        let polygon;
        const triangles: Triangle[] = [];
        const visited: boolean[] = [];
        const triangleByLine = [];
        let k = 0;
        let t;
        for (let i = 0; i < indices.length; i += 3) {
            visited[i] = false;
            t = triangles[k] = {
                id: k,
                ids: [indices[i], indices[i + 1], indices[i + 2]],
                pts: [points[indices[i]], points[indices[i + 1]], points[indices[i + 2]]],
                lines: [],
                reverseLines: []
            };
            t.lines[0] = t.ids[0] + "_" + t.ids[1];
            t.lines[1] = t.ids[1] + "_" + t.ids[2];
            t.lines[2] = t.ids[2] + "_" + t.ids[0];

            t.reverseLines[0] = t.ids[1] + "_" + t.ids[0];
            t.reverseLines[1] = t.ids[2] + "_" + t.ids[1];
            t.reverseLines[2] = t.ids[0] + "_" + t.ids[2];

            triangleByLine[t.lines[0]] = t;
            triangleByLine[t.reverseLines[0]] = t;

            triangleByLine[t.lines[1]] = t;
            triangleByLine[t.reverseLines[1]] = t;

            triangleByLine[t.lines[2]] = t;
            triangleByLine[t.reverseLines[2]] = t;

            k++;
        }

        //----

        const getNeightbourTriangle = (line, triangles) => {

            let t, id, id2 = -1;
            for (let i = 0; i < triangles.length; i++) {
                t = triangles[i];

                if (visited[t.id]) continue;

                id = t.reverseLines.indexOf(line);
                id2 = t.lines.indexOf(line);


                if (id !== -1 || id2 !== -1) {

                    return t;
                }
            }
            return null;
        }

        const isConvex = (t: { x: number, y: number }[]): boolean => {
            let prev = 0, curr = 0;
            for (let i = 0; i < t.length; i++) {
                const next = (i + 1) % t.length;
                const crossProduct = (t[next].x - t[i].x) * (t[(i + 2) % t.length].y - t[i].y) -
                    (t[next].y - t[i].y) * (t[(i + 2) % t.length].x - t[i].x);
                if (i === 0) {
                    curr = crossProduct;
                } else {
                    if (prev * crossProduct < 0) {
                        return false;
                    }
                    curr = crossProduct;
                }
                prev = curr;
            }
            return true;
        }

        const addNeightbour = (line, triangles) => {
            const neightbour = getNeightbourTriangle(line, triangles);

            //console.log("neightbour = ", neightbour)

            const polyPoints = polygon.points;
            const nb = polyPoints.length;
            const temp = polyPoints.concat();


            const pts = neightbour.pts;
            let pt, pt2, newLine;
            let n = 0;
            for (let i = 0; i < 3; i++) {
                pt = pts[i];
                if (!polyPoints.includes(pt)) {

                    temp[nb] = pt;
                    //console.log(temp)
                    if (isConvex(temp)) {

                        console.log("CONVEX")
                        visited[neightbour.id] = true;
                        polygon.points.push(pt);
                        polygon.triangles.push(neightbour);


                        //on check les triangles collé aux 2 nouvelles lignes du polygone partageant le nouveau point

                        /*for (let j = 0; j < 3; j++) {
                            if (i === j) continue;
                            pt2 = pts[j]
                            newLine = pt.id + "_" + pt2.id;

                            addNeightbour(newLine, triangles)
                            
                        }*/
                    }
                }
            }

        }


        const getNewPoint = (sourceTriangle, newTriangle) => {
            const sourceIds = sourceTriangle.ids;
            const newIds = newTriangle.ids;

            for (let i = 0; i < 3; i++) {
                let id = newIds[i];
                if (!sourceIds.includes(id)) return newTriangle.pts[i];
            }
        }


        const createPolygon = (triangle, onComplete: () => void) => {

            visited[triangle.id] = true;

            const nbTriangle = triangles.length;

            polygon = {
                triangles: [triangle],
                points: [triangle.pts[0], triangle.pts[1], triangle.pts[2]],
            }



            let t1, t2, l1, l2;

            for (let i = 0; i < triangles.length; i++) {
                t1 = triangles[i];
                if (t1 === triangle) continue;



            }



            for (let j = 0; j < polygon.triangles.length; j++) {
                let tri = polygon.triangles[j];
                let idd = triangles.indexOf(tri)
                if (idd !== -1) triangles.splice(idd, 1);
            }

            polygons.push(polygon);

            if (triangles.length > 0) {
                createPolygon(triangles[0], onComplete);
            } else {
                onComplete()
            }

        }

        console.log("C = ", isConvex(triangles[0].pts), triangles[0].pts)

        createPolygon(triangles[0], () => {
            console.log("completed = ", polygons.length)
        })

        /*
        let tLine: string;
        let poly, tri;
        for (let i = 0; i < 3; i++) { //for the 3 sides of the triangle source
            tLine = triangle.lines[i];

            addNeightbour(tLine, triangles);
            
            
            //console.log("poly = ", poly);
            if (poly) {
                for (let j = 0; j < poly.triangles.length; j++) {
                    tri = poly.triangles[j];
                    let idd = triangles.indexOf(tri)
                    if (idd !== -1) triangles.splice(idd, 1);
                }
            }
        }

        polygons.push(polygon);


        if (triangles.length) {
            //console.log("AAA")
            for (let i = 0; i < triangles.length; i++) {
                if (visited[triangles[i].id] === false) {
                    createPolygon(triangles[0])
                }
            }

        }

    }


    createPolygon(triangles[0]);

    console.warn("POLY ", polygons)






















    /*
    const getSharedEdge = (polygon: Pt[], triangle: { p1: Pt, p2: Pt, p3: Pt }): boolean => {
        //let shared = 0;
        //if (t1.p1 === t2.p1 || t1.p1 === t2.p2 || t1.p1 === t2.p3) shared++;
        //if (t1.p2 === t2.p1 || t1.p2 === t2.p2 || t1.p2 === t2.p3) shared++;
        //if (t1.p3 === t2.p1 || t1.p3 === t2.p2 || t1.p3 === t2.p3) shared++;
        //return shared >= 2;
        

        let shared = 0;
        let point1, point2;
        for (let i = 0; i < polygon.length; i++) {
            point1 = polygon[i];

            for (let point2 of [triangle.p1, triangle.p2, triangle.p3]) {
                if (point1 === point2) {
                    shared++;
                }
                if (shared === 2) {
                    return true;
                }
            }
        }
        return false;

    }



    const getAdjacentTriangle = (polygon: Pt[], triangles: { p1: Pt, p2: Pt, p3: Pt }[], visited: boolean[]): { p1: Pt, p2: Pt, p3: Pt } | null => {
        for (let t of triangles) {
            if (!visited[triangles.indexOf(t)]) {
                if (getSharedEdge(polygon, t)) {
                    return t;
                }
            }
        }
        return null;
    }

    const trianglesToConvexPolygons = (triangles): Pt[][] => {
        let convexPolygons: Pt[][] = [];
        let visited: boolean[] = new Array(triangles.length).fill(false);

        for (let i = 0; i < triangles.length; i++) {
            if (!visited[i]) {
                let convexPolygon: Pt[] = [];
                let currentTriangle = triangles[i];
                convexPolygon.push(currentTriangle.p1);
                convexPolygon.push(currentTriangle.p2);
                convexPolygon.push(currentTriangle.p3);
                visited[i] = true;

                let nextTriangle = getAdjacentTriangle(convexPolygon, triangles, visited);
                while (nextTriangle != null) {
                    

                    visited[triangles.indexOf(nextTriangle)] = true;
                    nextTriangle = getAdjacentTriangle(convexPolygon, triangles, visited);
                }
                convexPolygons.push(convexPolygon);
            }
        }
        return convexPolygons;
    }



    //--------------------

    const mergeTwoPolygons = (p1: Pt[], p2: Pt[]): Pt[] => {
        let points = [];
        points = points.concat(p1);

        let point;
        for (let i = 0; i < p2.length; i++) {
            point = p2[i];
            if (!points.includes(point)) {
                points.push(point);
            }
        }


        return points;
    }

    const shareEdge = (p1: Pt[], p2: Pt[]): boolean => {
        let shared = 0;
        let point1, point2;
        for (let i = 0; i < p1.length; i++) {
            point1 = p1[i];
            for (let j = 0; j < p2.length; j++) {
                point2 = p2[j];

                if (point1 === point2) {
                    shared++;
                }
                if (shared === 2) {
                    return true;
                }
            }
        }
        return false;
    }

    const getAdjacentPolygon = (polygon: Pt[], polygons: Pt[][], visited: boolean[]): Pt[] | null => {
        for (let p of polygons) {
            if (p !== polygon && !visited[polygons.indexOf(p)]) {
                if (shareEdge(polygon, p)) {
                    return p;
                }
            }
        }
        return null;
    }


    const mergePolygons = (polygons: Pt[][]): Pt[] => {
        let newPolygons = [];
        let visited = new Array(polygons.length).fill(false);

        for (let i = 0; i < polygons.length; i++) {
            if (!visited[i]) {
                let polygon = polygons[i];
                visited[i] = true;

                let nextPolygon = getAdjacentPolygon(polygon, polygons, visited);
                while (nextPolygon != null) {
                    polygon = mergeTwoPolygons(polygon, nextPolygon);
                    visited[polygons.indexOf(nextPolygon)] = true;
                    nextPolygon = getAdjacentPolygon(polygon, polygons, visited);
                }
                newPolygons.push(polygon);
            }
        }
        return newPolygons;
    }

    //-------
    const polygons = trianglesToConvexPolygons(triangles)
    console.log("polygons.length = ", polygons.length)

    //const mergedPolygons = mergePolygons(polygons);
    //console.log("mergedPolygons.length = ", mergedPolygons.length)
    */
        return polygons;
    }


}