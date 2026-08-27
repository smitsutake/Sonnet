/** @vitest-environment jsdom */
import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import NumberField from "./NumberField";

afterEach(cleanup);

describe("NumberField", () => {
	it("lets the field be cleared without a zero jumping back in", () => {
		// Binding straight to a number made this impossible: "" parsed to 0, so
		// a zero reappeared under the caret before the next digit was typed.
		const onChange = vi.fn();
		render(<NumberField value={5} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score") as HTMLInputElement;

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: ""}});
		expect(input.value).toBe("");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("accepts a multi-digit number typed one key at a time", () => {
		const onChange = vi.fn();
		render(<NumberField value={0} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score") as HTMLInputElement;

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: "1"}});
		fireEvent.change(input, {target: {value: "17"}});
		expect(input.value).toBe("17");

		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledWith(17);
	});

	it("treats an empty field as zero on blur", () => {
		const onChange = vi.fn();
		render(<NumberField value={5} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score");

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: ""}});
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledWith(0);
	});

	it("commits on Enter, so a value is not lost by pressing Save straight away", () => {
		const onChange = vi.fn();
		render(<NumberField value={0} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score");

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: "12"}});
		fireEvent.keyDown(input, {key: "Enter"});
		expect(onChange).toHaveBeenCalledWith(12);
	});

	it("clamps below the minimum rather than storing a negative mark", () => {
		const onChange = vi.fn();
		render(<NumberField value={5} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score");

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: "-3"}});
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledWith(0);
	});

	it("ignores text that is not a number", () => {
		const onChange = vi.fn();
		render(<NumberField value={5} onChange={onChange} ariaLabel="Score" />);
		const input = screen.getByLabelText("Score");

		fireEvent.focus(input);
		fireEvent.change(input, {target: {value: "abc"}});
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledWith(0);
	});

	it("follows the parent while it is not being edited", () => {
		const {rerender} = render(
			<NumberField value={5} onChange={() => {}} ariaLabel="Score" />
		);
		rerender(<NumberField value={9} onChange={() => {}} ariaLabel="Score" />);
		expect((screen.getByLabelText("Score") as HTMLInputElement).value).toBe("9");
	});
});
