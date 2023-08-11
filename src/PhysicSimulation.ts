import Box2DFactory from "box2d-wasm";
import { makeDebugDraw } from './debugDraw';


type Box2D = typeof Box2D & EmscriptenModule
export class PhysicSimulation {

    protected _w: number;
    protected _h: number;
    protected _box2d: Box2D;
    protected _gravity: Box2D.b2Vec2;
    protected _world: Box2D.b2World;
    protected _pixelPerMeter: number = 32;
    protected _cameraOffsetMetres: { x: number, y: number } = { x: 0, y: 0 };

    protected _ground: Box2D.b2Body;
    protected _canvas: HTMLCanvasElement;


    constructor(w: number, h: number, gravity?: { x: number, y: number }, onReady?: () => void, wasmFileLocation?: (fileName, directory) => string) {

        this._w = w;
        this._h = h;

        if (!wasmFileLocation) {
            wasmFileLocation = (url, scriptDirectory) => {
                let t = scriptDirectory.split("/")
                t.pop();
                t.pop();
                t.pop();
                let s = t.join("/")
                s += "/box2d-wasm/dist/es/"

                console.log(s);
                return `${s}${url}`;
            }
        }

        Box2DFactory({
            locateFile: wasmFileLocation
        }).then((box2D) => {
            this._box2d = box2D;

            if (gravity) this._gravity = new box2D.b2Vec2(gravity.x, gravity.y);
            else this._gravity = new box2D.b2Vec2(0, 10);
            this._world = new box2D.b2World(this._gravity);


            this._ground = this._world.CreateBody(new box2D.b2BodyDef());


            const canvas = this._canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            console.log("OK")
            canvas.width = w;
            canvas.height = h;


            const debugDraw = makeDebugDraw(canvas.getContext("2d"), this.pixelsPerMeter, box2D);
            this._world.SetDebugDraw(debugDraw);

            if (onReady) onReady();
        })
    }

    private drawCanvas() {
        const ctx = this._canvas.getContext("2d");

        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        ctx.save();

        ctx.scale(this.pixelsPerMeter, this.pixelsPerMeter);
        const { x, y } = this.cameraOffsetMetres;
        ctx.translate(x, y);
        ctx.lineWidth /= this.pixelsPerMeter;
        ctx.fillStyle = 'rgb(255,255,0)';
        this.world.DebugDraw();

        ctx.restore();

    }

    public start() {
        // calculate no more than a 60th of a second during one world.Step() call
        const maxTimeStepMs = 1 / 60 * 1000;
        const velocityIterations = 1;
        const positionIterations = 1;

        let prevMs;
        const loop = () => {
            const nowMs = window.performance.now();
            const deltaMs = nowMs - prevMs;
            prevMs = nowMs;
            const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
            this.world.Step(clampedDeltaMs / 1000, velocityIterations, positionIterations);
            this.drawCanvas();
            requestAnimationFrame(loop);
        }
        prevMs = window.performance.now();
        loop()
    }



    public createSimulationBorders(left: boolean = true, right: boolean = true, bottom: boolean = true, top: boolean = true) {

        const side = 100;
        const box2d = this.box2d;
        let shape = new box2d.b2EdgeShape();
        const scale = 1 / this.pixelsPerMeter;
        const createBorder = (type: string) => {
            let t = [];
            switch (type) {
                case "top":
                    t = [0, 0, this.width, 0]
                    break;
                case "bottom":
                    t = [0, this.height, this.width, this.height]
                    break;
                case "left":
                    t = [0, 0, 0, this.height]
                    break;
                case "right":
                    t = [this.width, 0, this.width, this.height]
                    break;
            }

            shape.SetTwoSided(new box2d.b2Vec2(t[0] * scale, t[1] * scale), new box2d.b2Vec2(t[2] * scale, t[3] * scale))
            this._ground.CreateFixture(shape, 0);
        }


        if (left) createBorder("left");
        if (right) createBorder("right");
        if (top) createBorder("top");
        if (bottom) createBorder("bottom");
    }


    public get width(): number { return this._w; }
    public get height(): number { return this._h; }
    public get box2d(): typeof Box2D & EmscriptenModule { return this._box2d; }
    public get gravity(): Box2D.b2Vec2 { return this._gravity; }
    public get world(): Box2D.b2World { return this._world; }
    public get pixelsPerMeter(): number { return this._pixelPerMeter; }
    public get cameraOffsetMetres(): { x: number, y: number } { return this._cameraOffsetMetres; }

}