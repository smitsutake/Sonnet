/** @vitest-environment jsdom */
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render} from "@testing-library/react";
import {createRef} from "react";
import FeedbackArrows from "./FeedbackArrows";
import {FeedbackItem} from "./feedbackTypes";

afterEach(cleanup);

const item: FeedbackItem = {
	id: "fb-1",
	content: "x",
	author: "Leon",
	createdAt: "2026-08-13T00:00:00.000Z",
	targets: ["8-1"],
};

describe("FeedbackArrows rendering", () => {
	it("draws nothing until a comment is selected", async () => {
		document.body.innerHTML =
			'<div data-feedback-id="fb-1"></div><div data-goal-instance="8-1"></div>';
		const containerRef = createRef<HTMLDivElement>();
		const {container} = render(
			<div ref={containerRef}>
				<FeedbackArrows items={[item]} containerRef={containerRef} selectedItemId={null} />
			</div>
		);
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(container.querySelectorAll("path[stroke]")).toHaveLength(0);
	});

	it("emits a path element for the selected comment", async () => {
		// Stand in for the box and the goal row that live elsewhere in the page.
		document.body.innerHTML =
			'<div data-feedback-id="fb-1"></div><div data-goal-instance="8-1"></div>';

		Element.prototype.getBoundingClientRect = vi.fn(function (this: Element) {
			if (this.hasAttribute?.("data-feedback-id")) {
				return {left: 700, top: 100, right: 800, width: 100, height: 20} as DOMRect;
			}
			if (this.hasAttribute?.("data-goal-instance")) {
				return {left: 100, top: 300, right: 200, width: 100, height: 20} as DOMRect;
			}
			return {left: 0, top: 0, right: 1000, width: 1000, height: 800} as DOMRect;
		});

		const containerRef = createRef<HTMLDivElement>();
		const {container} = render(
			<div ref={containerRef}>
				<FeedbackArrows items={[item]} containerRef={containerRef} selectedItemId="fb-1" />
			</div>
		);

		// The overlay recomputes on an animation frame.
		await new Promise((resolve) => setTimeout(resolve, 50));

		const svg = container.querySelector("svg.feedback-arrows");
		expect(svg).toBeTruthy();
		const paths = svg!.querySelectorAll("path[stroke]");
		expect(paths.length).toBeGreaterThan(0);
	});
});
