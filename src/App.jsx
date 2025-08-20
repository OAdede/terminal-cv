import React, { useEffect } from "react";
import Terminal from "./components/Terminal";
import "./App.css";

export default function App() {
  useEffect(() => {
    document.title = "Ozan Ahmet Dede — Terminal CV";
  }, []);
  return <Terminal />;
}
