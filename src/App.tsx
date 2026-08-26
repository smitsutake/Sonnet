import {BrowserRouter, Routes, Route} from "react-router-dom";
import Welcome from "./components/Welcome";
import Papers from "./components/Papers";
import ProjectEdit from "./components/ProjectEdit";
import Layout from "./components/Layout";
import FeedbackProvider from "./components/feedback/FeedbackProvider";
import ViewModel from "./components/ViewModel";

const App = () => {
	return (
		<BrowserRouter basename="/mm-local-editor/">
			{/* FeedbackProvider sits above the router so that the reviewer's name
			    survives navigating between the welcome screen and the editor, but
			    is lost on any real page load. */}
			<FeedbackProvider>
				<Layout>
					<Routes>
						<Route path="/" element={<Welcome />} />
						<Route path="/papers" element={<Papers />} />
						<Route path="/projectEdit" element={<ProjectEdit />} />
						<Route path="/viewModel" element={<ViewModel />} />

					</Routes>
				</Layout>
			</FeedbackProvider>
		</BrowserRouter>
	);
};

export default App;
