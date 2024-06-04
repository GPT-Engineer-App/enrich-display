import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Index from "./pages/Index.jsx";
import ToggleItems from "./pages/ToggleItems.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Index />} />
        <Route path="/toggle-items" element={<ToggleItems />} />
      </Routes>
    </Router>
  );
}

export default App;
