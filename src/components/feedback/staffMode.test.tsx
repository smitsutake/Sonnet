/** @vitest-environment jsdom */
import {afterEach, describe, expect, it} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import FileProvider from "../context/FileProvider";
import FeedbackProvider from "./FeedbackProvider";
import StaffModeButton from "./StaffModeButton";
import WelcomeButtons from "../WelcomeButtons";

afterEach(cleanup);

const WelcomeHarness = () => (
	<MemoryRouter>
		<FileProvider>
			<FeedbackProvider>
				<StaffModeButton />
				<WelcomeButtons isDragging={false} setIsDragging={() => {}} />
			</FeedbackProvider>
		</FileProvider>
	</MemoryRouter>
);

const enterStaffMode = () => {
	fireEvent.click(screen.getByText("Staff mode"));
	fireEvent.click(screen.getByText("Yes"));
	fireEvent.change(screen.getByRole("textbox"), {
		target: {value: "Leon Sterling"},
	});
	fireEvent.click(screen.getByText("Continue"));
};

describe("staff mode", () => {
	it("offers only Create and Open until staff mode is on", () => {
		render(<WelcomeHarness />);
		expect(screen.getByText("Create Model")).toBeTruthy();
		expect(screen.getByText("Open Model")).toBeTruthy();
		expect(screen.queryByText("Mark model")).toBeNull();
	});

	it("adds Mark model once staff mode is on, leaving the others alone", () => {
		render(<WelcomeHarness />);
		enterStaffMode();
		expect(screen.getByText("Mark model")).toBeTruthy();
		// Create and Open must keep working exactly as before.
		expect(screen.getByText("Create Model")).toBeTruthy();
		expect(screen.getByText("Open Model")).toBeTruthy();
	});

	it("shows who is signed in", () => {
		render(<WelcomeHarness />);
		enterStaffMode();
		expect(screen.getByText(/Leon Sterling/)).toBeTruthy();
	});

	it("turns staff mode off again from the same button", () => {
		render(<WelcomeHarness />);
		enterStaffMode();
		fireEvent.click(screen.getByText("Staff mode: on"));
		expect(screen.queryByText("Mark model")).toBeNull();
		expect(screen.getByText("Staff mode")).toBeTruthy();
	});

	it("keeps staff mode on when Open Model is used", () => {
		// Open Model used to drop the session. Now that the switch is explicit,
		// only the switch turns it off.
		render(<WelcomeHarness />);
		enterStaffMode();
		fireEvent.click(screen.getByText("Open Model"));
		expect(screen.getByText("Staff mode: on")).toBeTruthy();
	});
});
