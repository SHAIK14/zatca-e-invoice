// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceSearchPage from "./components/InvoiceSearchPage";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Navbar from "./components/Navbar";
import AddressPage from "./components/AddressPage";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/search"
            element={
              <>
                <Navbar />
                <InvoiceSearchPage />
              </>
            }
          />
          <Route
            path="/form"
            element={
              <>
                <Navbar />
                <InvoiceForm />
              </>
            }
          />
          <Route
            path="/form/:id"
            element={
              <>
                <Navbar />
                <InvoiceForm />
              </>
            }
          />
          <Route
            path="/view/:id"
            element={
              <>
                <Navbar />
                <InvoiceForm />
              </>
            }
          />
          <Route
            path="/addresses"
            element={
              <>
                <Navbar />
                <AddressPage />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
