
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideBar from "./Component/SideBar.jsx";
import HomePage from "./Component/Pages/HomePage.jsx";
import UserList from "./Component/Pages/UserList.jsx";
import AboutUs from "./Component/Pages/AboutUs.jsx";
import ContactUs from "./Component/Pages/ContactUs.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex">
        <SideBar />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/UserList" element={<UserList />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
