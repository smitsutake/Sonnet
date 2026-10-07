// ============================================================
// Stable model identity
// ============================================================
//
// Version History needs to recognise "the same model" across browser
// sessions, but there is nothing reliable to key that on: the editor only
// ever sees a plain File from an <input type=file> or a drag-and-drop, never
// a persistent handle, and even a handle would not survive the user doing
// "Save As" to a different file, renaming it on disk, or emailing a copy to
// someone else.
//
// Instead every model carries its own id inside the saved .json itself, next
// to "feedback" -- the same way a database row carries its own primary key.
// Version History keys its IndexedDB entries on this id, not on the file's
// name or path, so history follows the model's content wherever the file
// goes, and survives the browser being closed and reopened.
//
// A file saved before this feature existed has no id. It is stamped with a
// freshly minted one the first time it is opened, exactly like a
// pre-feedback file is stamped "unfeedbacked" on its first save (see
// feedbackTypes.ts) -- from that point on its history is tracked, but
// whatever happened to it before this feature existed is not retroactively
// recoverable.
export const newModelId = (): string =>
	`m_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
