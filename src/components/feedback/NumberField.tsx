import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";

// ============================================================
// Number entry that can actually be typed into
// ============================================================
//
// A number input bound straight to a number is awkward to edit: clearing the
// field yields "", which parses to 0, so a zero reappears under the cursor
// before the next digit is typed, and the caret jumps. Intermediate states
// like "-" and "1." have the same problem -- none of them is a finite number,
// so they get rewritten the moment they are entered.
//
// This keeps the raw text while the field has focus and only converts on
// blur, which is the point where the value has to be a number again. The
// parent still receives a number and never has to know about the text.

type NumberFieldProps = {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	ariaLabel?: string;
	style?: React.CSSProperties;
};

const NumberField: React.FC<NumberFieldProps> = ({
	value,
	onChange,
	min = 0,
	ariaLabel,
	style,
}) => {
	const [text, setText] = useState(String(value));
	const [isEditing, setIsEditing] = useState(false);

	// Follow the parent while the field is idle, so a reset or a reload of the
	// stored grade shows through. While editing, the text is the source of
	// truth and must not be overwritten mid-keystroke.
	useEffect(() => {
		if (!isEditing) {
			setText(String(value));
		}
	}, [value, isEditing]);

	const commit = (raw: string) => {
		const trimmed = raw.trim();
		// An empty field means zero rather than an error: a reviewer clearing a
		// component score is saying it is worth nothing, not making a mistake.
		const parsed = trimmed === "" ? 0 : Number(trimmed);
		const next = Number.isFinite(parsed) ? Math.max(min, parsed) : 0;
		setText(String(next));
		onChange(next);
	};

	return (
		<Form.Control
			type="number"
			inputMode="decimal"
			min={min}
			aria-label={ariaLabel}
			style={style}
			value={text}
			onFocus={() => setIsEditing(true)}
			onChange={(event) => setText(event.target.value)}
			onBlur={(event) => {
				setIsEditing(false);
				commit(event.target.value);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					// Commit without waiting for focus to move, so the value is
					// stored even if the reviewer presses Save straight away.
					commit((event.target as HTMLInputElement).value);
				}
			}}
		/>
	);
};

export default NumberField;
