// when the guide is allowed to open by itself. the overlay makes everything
// unclickable, so the cypress specs would fail on it instead of on what
// they're testing.

type TourOverride = "on" | "off" | null;

// the flag has to outlive the url - "Create Model" navigates to /projectEdit
// and loses the query string, so remember it for the tab
const OVERRIDE_KEY = "ammber.tour";

const overrideFrom = (search: string): TourOverride => {
	const value = new URLSearchParams(search).get("tour");
	return value === "on" || value === "off" ? value : null;
};

// sessionStorage not localStorage - just for this tab. wrapped because storage
// throws in some privacy modes.
const rememberedOverride = (): TourOverride => {
	try {
		const value = window.sessionStorage.getItem(OVERRIDE_KEY);
		return value === "on" || value === "off" ? value : null;
	} catch {
		return null;
	}
};

const remember = (override: TourOverride): void => {
	if (!override) {
		return;
	}
	try {
		window.sessionStorage.setItem(OVERRIDE_KEY, override);
	} catch {
		// then the flag only lasts as long as the url does, which is fine
	}
};

// grab it as soon as the module loads (app boot, usually on the welcome page).
// waiting for the editor to mount is too late, the query string is gone by then.
if (typeof window !== "undefined") {
	remember(overrideFrom(window.location.search));
}

// cypress puts a Cypress object on the app's window - this is the documented
// way for an app to tell it's being driven by a spec
const isUnderTest = (): boolean =>
	typeof window !== "undefined" && "Cypress" in window;

export const shouldOpenAutomatically = (
	search: string = typeof window === "undefined" ? "" : window.location.search,
	underTest: boolean = isUnderTest()
): boolean => {
	const fromUrl = overrideFrom(search);
	remember(fromUrl);

	const override = fromUrl ?? rememberedOverride();

	if (override !== null) {
		return override === "on";
	}

	return !underTest;
};
