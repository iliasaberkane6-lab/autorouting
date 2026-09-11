import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { MultilayerIjump } from "../../MultilayerIjump"
import { getDebugSvg } from "../../../infinite-grid-ijump-astar/tests/fixtures/get-debug-svg"

const start = { x: -5, y: 1.382976, layer: "top", layers: ["top"] }
const goal = {
  x: 5,
  y: 1.358742,
  layer: "top",
  layers: ["top", "bottom"],
}

const obstacles = [
  {
    type: "rect" as const,
    layers: ["top"],
    center: { x: -2.324152, y: 2.740568 },
    width: 2.5822325,
    height: 2.196495,
    connectedTo: ["obstacle_a"],
  },
  {
    type: "rect" as const,
    layers: ["top"],
    center: { x: -1.702904, y: 1.493536 },
    width: 0.6778625,
    height: 1.6726475,
    connectedTo: ["obstacle_b"],
  },
]

const input = {
  obstacles,
  connections: [
    {
      name: "conn",
      pointsToConnect: [start, goal],
    },
  ],
  layerCount: 2,
  minTraceWidth: 0.15,
  bounds: { minX: -6, maxX: 6, minY: -6, maxY: 6 },
}

const inputCircuitJson: AnyCircuitElement[] = obstacles.map((obstacle, i) => ({
  type: "pcb_smtpad",
  pcb_smtpad_id: `obstacle_${i}`,
  pcb_component_id: `component_${i}`,
  shape: "rect",
  layer: "top",
  x: obstacle.center.x,
  y: obstacle.center.y,
  width: obstacle.width,
  height: obstacle.height,
}))

test("repro: multilayer ijump makes a wild jump away from two conjoined obstacles", () => {
  const autorouter = new MultilayerIjump({
    input: input as any,
    VIA_COST: 1,
    MAX_ITERATIONS: 500,
    debug: true,
  })

  const solution = autorouter.solveAndMapToTraces()

  expect(solution).toHaveLength(1)
  expect(
    getDebugSvg({
      inputCircuitJson,
      autorouter,
      solution,
      rowHeight: 4,
      colWidth: 14,
      colCount: 4,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
