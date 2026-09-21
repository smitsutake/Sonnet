/** @vitest-environment jsdom */
import {afterEach, describe, expect, it} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import FileProvider from "../context/FileProvider";
import FeedbackProvider from "./FeedbackProvider";
import FeedbackPanel from "./FeedbackPanel";
import TeacherGateModal from "./TeacherGateModal";
import {useFeedbackContext} from "./feedbackContext";

// A stand-in for a goal row rendered by Tree.
//
// Real rows are drag sources: the drag library consumes the interaction from
// mousedown onwards and the row can be re-rendered before mouseup, so the
// browser never fires a click on them. This stand-in therefore swallows click
// entirely, so a regression back to a click listener fails the tests instead
// of passing them.
const FakeGoalRow = ({instanceId}: {instanceId: string}) => (
	<div
		data-goal-instance={instanceId}
		onClick={(event) => event.stopPropagation()}
	>
		goal {instanceId}
	</div>
);

const Harness = () => {
	const {startReviewSession, items, selectedItemId} = useFeedbackContext();
	return (
		<div>
			<button onClick={() => startReviewSession("Leon Sterling")}>sign in</button>
			<FakeGoalRow instanceId="101-1" />
			<FakeGoalRow instanceId="103-1" />
			<FeedbackPanel />
			<div data-testid="targets">
				{items.map((i) => `${i.id}:${i.targets.join(",")}`).join("|")}
			</div>
			<div data-testid="selected">{selectedItemId ?? "none"}</div>
		</div>
	);
};

afterEach(cleanup);

const setup = () =>
	render(
		<FileProvider>
			<FeedbackProvider>
				<Harness />
			</FeedbackProvider>
		</FileProvider>
	);

describe("linking a comment to goals", () => {
	it("links a goal, stays armed, and links a second goal", () => {
		setup();
		fireEvent.click(screen.getByText("sign in"));
		fireEvent.click(screen.getByLabelText("Add new feedback"));
		fireEvent.click(screen.getByText("Link goal"));

		fireEvent.mouseDown(screen.getByText("goal 101-1"));
		expect(screen.getByTestId("targets").textContent).toContain("101-1");

		// The old code dropped out of linking mode here.
		expect(screen.queryByText("Click a goal…")).toBeTruthy();

		fireEvent.mouseDown(screen.getByText("goal 103-1"));
		expect(screen.getByTestId("targets").textContent).toContain("101-1,103-1");
	});

	it("unlinks a goal when it is clicked again", () => {
		setup();
		fireEvent.click(screen.getByText("sign in"));
		fireEvent.click(screen.getByLabelText("Add new feedback"));
		fireEvent.click(screen.getByText("Link goal"));
		fireEvent.mouseDown(screen.getByText("goal 101-1"));
		fireEvent.mouseDown(screen.getByText("goal 101-1"));
		expect(screen.getByTestId("targets").textContent).toMatch(/:$|:\|/);
	});

	it("does not drop out of linking mode when a non-goal area is clicked", () => {
		setup();
		fireEvent.click(screen.getByText("sign in"));
		fireEvent.click(screen.getByLabelText("Add new feedback"));
		fireEvent.click(screen.getByText("Link goal"));
		fireEvent.mouseDown(screen.getByText("sign in"));
		expect(screen.queryByText("Click a goal…")).toBeTruthy();
	});

	it("links on mousedown, because drag rows never fire a click", () => {
		setup();
		fireEvent.click(screen.getByText("sign in"));
		fireEvent.click(screen.getByLabelText("Add new feedback"));
		fireEvent.click(screen.getByText("Link goal"));

		// A click alone must not be relied on: the real rows never emit one.
		fireEvent.click(screen.getByText("goal 101-1"));
		expect(screen.getByTestId("targets").textContent).not.toContain("101-1");

		fireEvent.mouseDown(screen.getByText("goal 101-1"));
		expect(screen.getByTestId("targets").textContent).toContain("101-1");
	});

	it("arming a box also selects it", () => {
		setup();
		fireEvent.click(screen.getByText("sign in"));
		fireEvent.click(screen.getByLabelText("Add new feedback"));
		fireEvent.click(screen.getByText("Link goal"));
		expect(screen.getByTestId("selected").textContent).not.toBe("none");
	});
});

describe("teacher gate", () => {
	it("asks for confirmation then a name", () => {
		let captured: string | null = null;
		render(
			<TeacherGateModal
				show
				onCancel={() => {}}
				onConfirm={(name) => {
					captured = name;
				}}
			/>
		);
		expect(screen.getByText("Are you a teacher?")).toBeTruthy();
		fireEvent.click(screen.getByText("Yes"));
		expect(screen.getByText("Your name?")).toBeTruthy();
		fireEvent.change(screen.getByRole("textbox"), {
			target: {value: "  Leon Sterling  "},
		});
		fireEvent.click(screen.getByText("Continue"));
		expect(captured).toBe("Leon Sterling");
	});
});
