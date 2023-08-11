import { VectorizedShape } from "imagetovector/src/VectorizedShape";
import { PhysicSimulation } from "./PhysicSimulation";
import { TriangleListToPolygonList } from "./TriangleListToPolygonList";

export class PhysicShape {

    private sim: PhysicSimulation;

    constructor(physicSim: PhysicSimulation) {
        this.sim = physicSim;
    }



    private createPhysicVertex(shape: VectorizedShape, size: number) {

        size /= this.sim.pixelsPerMeter;

        let w, h;


        if (shape.width >= shape.height) {
            w = size;
            h = size * shape.height / shape.width;
        } else {
            h = size;
            w = h * shape.width / shape.height
        }

        console.log(w, h, shape.width, shape.height)

        const { b2Vec2 } = this.sim.box2d;

        const points: { x: number, y: number }[] = shape.triangulation.points;
        const physicVertex = [];
        for (let i = 0; i < points.length; i++) {
            physicVertex[i] = new b2Vec2(points[i].x * w, points[i].y * h)
        }

        return physicVertex;
    }

    private createPolygonShape(vertices: Box2D.b2Vec2[]): Box2D.b2PolygonShape {
        const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } = this.sim.box2d;
        const shape = new b2PolygonShape();
        const buffer = _malloc(vertices.length * 8);
        let offset = 0;
        for (let i = 0; i < vertices.length; i++) {
            HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
            HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
            offset += 8;
        }
        const ptr_wrapped = wrapPointer(buffer, b2Vec2);
        shape.Set(ptr_wrapped, vertices.length);


        return shape;
    }

    public createPhysicBody(shape: VectorizedShape, size: number, x: number, y: number) {
        const { b2BodyDef, b2Vec2, b2_dynamicBody } = this.sim.box2d;

        const def = new b2BodyDef();
        def.set_type(b2_dynamicBody);
        def.set_position(new b2Vec2(x / this.sim.pixelsPerMeter, y / this.sim.pixelsPerMeter));


        const body = this.sim.world.CreateBody(def);

        /*
        const physicVertex = this.createPhysicVertex(shape, size);
        const polygons: any = TriangleListToPolygonList.convert(physicVertex, shape.triangulation.triangles);


        for (let i = 0; i < polygons.length; i++) {
            console.log(i, polygons[i])
            body.CreateFixture(this.createPolygonShape(polygons[i]), 1);
        }
        */



        const indices = shape.triangulation.triangles;
        const physicVertex = this.createPhysicVertex(shape, size);

        let i0: number, i1: number, i2: number;
        let p0: Box2D.b2Vec2, p1: Box2D.b2Vec2, p2: Box2D.b2Vec2;

        for (let i = 0; i < indices.length; i += 3) {

            i0 = indices[i];
            i1 = indices[i + 1];
            i2 = indices[i + 2];

            p0 = physicVertex[i0];
            p1 = physicVertex[i1];
            p2 = physicVertex[i2];

            //if (false == ((p0.x == p1.x && p1.x == p2.x) || (p0.y == p1.y && p1.y == p2.y))) {
            body.CreateFixture(this.createPolygonShape([p0, p1, p2]), 10);
            //}
        }


        body.SetLinearVelocity(new b2Vec2(0, 0));
        body.SetAwake(true);
        body.SetEnabled(true);
        body.SetSleepingAllowed(true)
        return body;
    }


}