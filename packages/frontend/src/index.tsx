/* @refresh reload */
import { render } from "solid-js/web";

import "@backend/public";

import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

render(() => <App />, root!);
