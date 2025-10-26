import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import AppRoutes from "./Routes/AppRoutes";

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <AppRoutes />
      </main>
    </Router>
  );
}

export default App;
