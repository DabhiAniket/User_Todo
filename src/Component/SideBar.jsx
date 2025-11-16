import { Phone, Home, Info, Menu, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";


const SideBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      
      <div className={`bg-gray-700 text-white transition-all duration-300 ${ open ? "w-64" : "w-20"} min-h-screen`}>
        
        <div className="flex justify-between items-center p-4">
          <h2 className={`text-4xl font-bold transition-all ${ open ? "block" : "hidden" }`} >
            User Todo
          </h2>

          <button onClick={() => setOpen(!open)} className="p-2 bg-gray-800 rounded hover:bg-gray-600" >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="mt-4">
          <ul>
            <NavLink to="/">
              <li className="flex items-center p-4 hover:text-indigo-400 cursor-pointer">
                <Home />
                <span
                  className={`ml-4 text-xl font-semibold ${
                    open ? "block" : "hidden"
                  }`}
                >
                  Home
                </span>
              </li>
            </NavLink>

            <NavLink to="/UserList">
              <li className="flex items-center p-4 hover:text-indigo-400 cursor-pointer">
                <Users />
                <span
                  className={`ml-4 text-xl font-semibold ${
                    open ? "block" : "hidden"
                  }`}
                >
                  Users
                </span>
              </li>
            </NavLink>

            <NavLink to="/aboutus">
              <li className="flex items-center p-4 hover:text-indigo-400 cursor-pointer">
                <Info />
                <span
                  className={`ml-4 text-xl font-semibold ${
                    open ? "block" : "hidden"
                  }`}
                >
                  About Us
                </span>
              </li>
            </NavLink>

            <NavLink to="/contactus">
              <li className="flex items-center p-4 hover:text-indigo-400 cursor-pointer">
                <Phone />
                <span
                  className={`ml-4 text-xl font-semibold ${
                    open ? "block" : "hidden"
                  }`}
                >
                  Contact Us
                </span>
              </li>
            </NavLink>
          </ul>
        </nav>
      </div>

      
    </div>
  );
};

export default SideBar;




