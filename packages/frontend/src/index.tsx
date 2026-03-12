/* @refresh reload */
import "@backend/public";
import { render } from "solid-js/web";

import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

render(() => <App />, root!);
