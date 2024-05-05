import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InvoiceForm from "./components/InvoiceForm";
// import InvoiceSearchPage from "./components/InvoiceSearchPage";
import InvoiceSearchPage from "./components/searchTest";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InvoiceSearchPage />} />
          <Route path="/form" element={<InvoiceForm />} />
          <Route path="/form/:id" element={<InvoiceForm />} />
          <Route path="/view/:id" component={<InvoiceForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
