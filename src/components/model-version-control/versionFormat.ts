// Full date + time, used in the Version History list so two checkpoints taken
// on the same day are still tellable apart.
export const formatVersionTimestamp = (iso: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

// Newest first.
export const byNewest = <T extends {createdAt: string}>(a: T, b: T): number =>
	b.createdAt.localeCompare(a.createdAt);
