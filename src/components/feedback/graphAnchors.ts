import type {Cell, Graph} from "@maxgraph/core";
import {InstanceId} from "../types.ts";
import {RectLike} from "./feedbackGeometry.ts";

// ============================================================
// Locating goals on the rendered model
// ============================================================
//
// Feedback arrows point at the shapes in the rendered model, which maxGraph
// paints onto its own surface. There is no DOM element per goal there, so the
// shapes cannot be found with querySelector the way hierarchy rows can.
//
// maxGraph does know where everything is, and GraphContext already exposes the
// Graph instance, so nothing in GraphWorker has to change. Cells are given
// stable ids when they are inserted, built by generateCellId:
//
//   Functional-8-1              a single goal, instanceId 8-1
//   Nonfunctional-[8-1;9-2]     a shape shared by several goals
//
// The instanceId embedded in those ids is the same one the feedback data
// stores, so a link made on the canvas and a link made in the hierarchy are
// the same link.

// maxGraph's own name for its click event. Declared here as a literal rather
// than imported, because pulling the runtime module into a component makes it
// unloadable under vitest. The value is asserted against maxGraph in
// graphAnchors.test.ts so a change upstream is caught.
export const GRAPH_CLICK_EVENT = "click";

export const FUNCTIONAL_CELL_PREFIX = "Functional-";
export const NONFUNCTIONAL_CELL_PREFIX = "Nonfunctional-";

// Pulls the instanceIds out of a cell id. Returns an empty array for ids that
// are not goal cells, such as the legend.
export const instanceIdsFromCellId = (cellId: string | null): InstanceId[] => {
	if (!cellId) {
		return [];
	}

	if (cellId.startsWith(FUNCTIONAL_CELL_PREFIX)) {
		const rest = cellId.slice(FUNCTIONAL_CELL_PREFIX.length);
		return /^\d+-\d+$/.test(rest) ? [rest as InstanceId] : [];
	}

	if (cellId.startsWith(NONFUNCTIONAL_CELL_PREFIX)) {
		const rest = cellId.slice(NONFUNCTIONAL_CELL_PREFIX.length);
		const inner = rest.replace(/^\[/, "").replace(/\]$/, "");
		return inner
			.split(/[;,]/)
			.map((part) => part.trim())
			.filter((part) => /^\d+-\d+$/.test(part)) as InstanceId[];
	}

	return [];
};

// The first instanceId on a cell. Non-functional shapes cover several goals;
// linking to the shape links to the goal it is anchored on, which is the one
// the reviewer clicked.
export const primaryInstanceIdOfCell = (cell: Cell | null): InstanceId | null => {
	const ids = instanceIdsFromCellId(cell?.getId() ?? null);
	return ids.length > 0 ? ids[0] : null;
};

// Walks the model and collects every cell, so that shapes shared by several
// goals can be found by inspecting their ids.
const allCells = (graph: Graph): Cell[] => {
	const collected: Cell[] = [];

	const visit = (cell: Cell) => {
		collected.push(cell);
		(cell.children ?? []).forEach(visit);
	};

	const root = graph.getDataModel().getRoot();
	if (root) {
		visit(root);
	}
	return collected;
};

// Finds the cell drawn for a goal. Functional goals have a cell id built
// directly from their instanceId, so they are looked up by id. Goals that
// share a non-functional shape need a scan, because their instanceId is one
// of several inside the id.
export const findCellForInstanceId = (
	graph: Graph,
	instanceId: InstanceId
): Cell | null => {
	const exact = graph
		.getDataModel()
		.getCell(`${FUNCTIONAL_CELL_PREFIX}${instanceId}`);
	if (exact) {
		return exact;
	}

	const shared = allCells(graph).find((cell) =>
		instanceIdsFromCellId(cell.getId()).includes(instanceId)
	);
	return shared ?? null;
};

// Screen rectangle of a goal's shape, in the same page coordinates that
// getBoundingClientRect returns, so it can be mixed with DOM measurements.
//
// Returns null when the goal is not currently drawn, when the canvas is
// hidden, or when the shape has been scrolled out of view.
export const graphRectForInstanceId = (
	graph: Graph | null,
	instanceId: InstanceId
): RectLike | null => {
	if (!graph) {
		return null;
	}

	const container = graph.container;
	if (!container || container.offsetParent === null) {
		// offsetParent is null when the canvas is inside a hidden panel.
		return null;
	}

	const cell = findCellForInstanceId(graph, instanceId);
	if (!cell) {
		return null;
	}

	const state = graph.view.getState(cell);
	if (!state) {
		return null;
	}

	const containerRect = container.getBoundingClientRect();

	// getState already accounts for zoom and translation, but is measured from
	// the container's own origin and ignores how far it has been scrolled.
	const left = containerRect.left + state.x - container.scrollLeft;
	const top = containerRect.top + state.y - container.scrollTop;

	// Ignore shapes that have been scrolled outside the visible canvas: an
	// arrow to somewhere off-screen is worse than no arrow.
	const isVisible =
		left + state.width > containerRect.left
		&& left < containerRect.right
		&& top + state.height > containerRect.top
		&& top < containerRect.bottom;

	if (!isVisible) {
		return null;
	}

	return {
		left,
		top,
		right: left + state.width,
		width: state.width,
		height: state.height,
	};
};

// Rectangles of every goal shape currently drawn, in page coordinates.
//
// Used as obstacles when routing feedback arrows, so a line does not end up
// lying across another goal's label. The arrow's own target is excluded --
// the arrow has to be able to reach it.
export const goalRectsExcept = (
	graph: Graph | null,
	exclude: InstanceId
): RectLike[] => {
	if (!graph) {
		return [];
	}

	const seen = new Set<string>();
	const rects: RectLike[] = [];

	allCells(graph).forEach((cell) => {
		const ids = instanceIdsFromCellId(cell.getId());
		if (ids.length === 0 || ids.includes(exclude)) {
			return;
		}
		const id = cell.getId();
		if (!id || seen.has(id)) {
			return;
		}
		seen.add(id);

		const rect = graphRectForInstanceId(graph, ids[0]);
		if (rect) {
			rects.push(rect);
		}
	});

	return rects;
};
