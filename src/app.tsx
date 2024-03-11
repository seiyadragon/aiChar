// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";
import { MetaProvider } from "@solidjs/meta";

import Navigation from "./components/Navigation";

import "./app.css";

export default function App() {

  return (
    <MetaProvider>
      <Router
        root={props => (
          <>
            <Navigation />
            <Suspense>{props.children}</Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
