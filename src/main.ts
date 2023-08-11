import Box2DFactory from "box2d-wasm";
import { makeDebugDraw } from './debugDraw';
import { ImageVectorizer } from "imagetovector/src/ImageVectorizer";
import { PhysicSimulation } from "./PhysicSimulation";
import { PhysicShape } from "./PhysicShape";
import { TriangleListToPolygonList } from "./TriangleListToPolygonList";
import { VectorizedShape } from "imagetovector/src/VectorizedShape";

let shapes;
const img = document.createElement("img");
const vectorizer = new ImageVectorizer();

img.onload = () => {
  shapes = vectorizer.process(img, {
    pathQuality: 65,
    curveType: "cubic",
    curveQuality: 20,
    triangulate: true,
    treshold: 0.05
  })

  const t = new VectorizedShape(shapes[0]).triangulation
  const polygons = TriangleListToPolygonList.convert(t.points, t.triangles)
  console.log("polygons = ", polygons)
  start();
}
img.src = "./assets/03.png"


const start = () => {

  const sim = new PhysicSimulation(800, 800, { x: 0, y: 10 }, () => {
    sim.createSimulationBorders();


    const size = 100;

    const y = 150;



    //console.log("nbTriangle = ", vecto.triangulation.triangles.length / 3)
    const vectos = [];
    for (let i = 0; i < 4; i++) {
      vectos[i] = new VectorizedShape(shapes[i]);


    }

    document.body.onclick = () => {
      document.body.onclick = undefined;
      let n = 0;
      let tempo = setInterval(() => {
        console.log(n);

        const x = 100 + Math.random() * 600;
        //new PhysicShape(sim).createPhysicBody(vectos[n++ % 4], size, 100, y);
        //new PhysicShape(sim).createPhysicBody(vectos[n++ % 4], size, 300, y);
        new PhysicShape(sim).createPhysicBody(vectos[n++ % 4], size, 500, y);
        //new PhysicShape(sim).createPhysicBody(vectos[n++ % 4], size, 700, y);

        if (n >= 60) clearInterval(tempo);


      }, 1000)

    }

    new PhysicShape(sim).createPhysicBody(vectos[0], size, 400, y);







    sim.start();

  });

}





/*

const vectorizer = new ImageVectorizer();
const output = document.createElement("canvas");
output.style.position = "absolute"
output.style.zIndex = "10"
document.body.appendChild(output);

img.onload = () => {
  const shapes = vectorizer.process(img, {
    pathQuality: 20,
    curveType: "cubic",
    curveQuality: 20,
    triangulate: true,
    treshold: 0.05
  })
  output.width = img.width;
  output.height = img.height;

  const ctx = output.getContext("2d");
  ctx.translate(512, 512)
  let vecto: VectorizedShape;
  for (let i = 0; i < shapes.length; i++) {
    vecto = new VectorizedShape(shapes[i]);
    ctx.translate(i * 256, 0)
    ctx.globalAlpha = 1;
    vecto.drawLinePaths(ctx, "#f00");
    //vecto.drawCurvePaths(ctx, "#00f");
    ctx.globalAlpha = 0.25;
    vecto.drawTriangles(ctx, "#0f0");
    console.log("nbTriangles = ", vecto.triangulation.triangles.length / 3)

  }

  start();

}
img.src = "./assets/03.png";

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 700;

document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");


const start = () => {

  Box2DFactory({
    locateFile: (url, scriptDirectory) => {

      let t = scriptDirectory.split("/")
      t.pop();
      t.pop();
      t.pop();
      let s = t.join("/")
      s += "/box2d-wasm/dist/es/"

      return `${s}${url}`;
    }
  }).then((box2D) => {

    const { b2BodyDef, b2_dynamicBody, b2PolygonShape, b2Vec2, b2World } = box2D;

    // in metres per second squared
    const gravity = new b2Vec2(0, 10);
    const world = new b2World(gravity);

    const pixelsPerMeter = 32;
    const cameraOffsetMetres = {
      x: 0,
      y: 0
    };

    const debugDraw = makeDebugDraw(ctx, pixelsPerMeter, box2D);
    world.SetDebugDraw(debugDraw);




    const sideLengthMetres = 1;
    const square = new b2PolygonShape();
    square.SetAsBox(sideLengthMetres / 2, sideLengthMetres / 2);

    const zero = new b2Vec2(0, 0);

    const bd = new b2BodyDef();
    bd.set_type(b2_dynamicBody);
    bd.set_position(new b2Vec2(200 / 32, 0))//zero);

    const body = world.CreateBody(bd);
    body.CreateFixture(square, 1);
    //body.SetTransform(new b2Vec2(200 / 32, 0), 0);
    body.SetLinearVelocity(zero);
    body.SetAwake(true);
    body.SetEnabled(true);

    // calculate no more than a 60th of a second during one world.Step() call
    const maxTimeStepMs = 1 / 60 * 1000;
    const velocityIterations = 1;
    const positionIterations = 1;

    
     // Advances the world's physics by the requested number of milliseconds
     //@param {number} deltaMs
    
    const step = (deltaMs: number) => {
      const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
      world.Step(clampedDeltaMs / 1000, velocityIterations, positionIterations);
    };

    
    // Prints out the vertical position of our falling square
    // (this is easier than writing a full renderer)
     
    //const whereIsOurSquare = () => {
    //  {
    //    const { x, y } = body.GetLinearVelocity();
    //    console.log("Square's velocity is:", x, y);
    //  }
    //  {
    //    const { x, y } = body.GetPosition();
    //    console.log("Square's position is:", x, y);
    //  }
    //};
    

    const drawCanvas = () => {
      ctx.fillStyle = 'rgb(0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#f00';
      ctx.fillRect(0, 0, 100, 100)

      ctx.save();
      ctx.scale(pixelsPerMeter, pixelsPerMeter);
      const { x, y } = cameraOffsetMetres;
      ctx.translate(x, y);
      ctx.lineWidth /= pixelsPerMeter;

      ctx.fillStyle = 'rgb(255,255,0)';
      world.DebugDraw();

      ctx.restore();
    };

    // @type {number} you can use this handle to cancel the callback via cancelAnimationFrame
    let handle;
    (function loop(prevMs) {
      const nowMs = window.performance.now();
      handle = requestAnimationFrame(loop.bind(null, nowMs));
      const deltaMs = nowMs - prevMs;
      step(deltaMs);
      //whereIsOurSquare();
      drawCanvas();
    }(window.performance.now()));


  });

}*/


