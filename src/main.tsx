import ReactDOM from "react-dom/client";
import {Toaster} from "react-hot-toast";

import "bootstrap/dist/css/bootstrap.min.css";
import "@maxgraph/core/css/common.css";
import "react-nestable/dist/styles/index.css";

import App from "./App.tsx";
import "./index.css";
import FileProvider from "./components/context/FileProvider.tsx";
import {enableMapSet} from "immer";

enableMapSet();

const rootContainer = document.getElementById("root");
ReactDOM.createRoot(rootContainer!).render(
    <FileProvider>
        <App/>
        <Toaster
            position="top-center"
            toastOptions={{
                style: {
                    fontSize: "20px",
                    padding: "16px 26px",
                    minWidth: "300px",
                    fontWeight: "500",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: "#198754",
                        secondary: "#fff",
                    },
                },
            }}
        />
    </FileProvider>
);