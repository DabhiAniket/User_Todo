import React, { useEffect, useState } from "react";

const UserList = () => {
  const [storedUsers, setStoredUsers] = useState([]);

  const data = () => {
    const raw = localStorage.getItem("storedUsers");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setStoredUsers(parsed);
          return;
        }
      } catch (err) {
        console.error("Error parsing stored users:", err);
      }
    }
    setStoredUsers([]);
  };

  useEffect(() => {
    data();
    const onUpdated = (e) => {
      if (e?.detail && Array.isArray(e.detail)) setStoredUsers(e.detail);
      else data();
    };
    const onStorage = (e) => { if (e.key === "storedUsers") data(); };

    window.addEventListener("storedUsersUpdated", onUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storedUsersUpdated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const deleteUsers = (id) => {
    if (!window.confirm("Delete this stored user?")) return;
    const updated = storedUsers.filter((u) => u.id !== id);
    setStoredUsers(updated);
    try {
      localStorage.setItem("storedUsers", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("storedUsersUpdated", { detail: updated }));
    } catch (err) {
      console.error("Failed to update storedUsers in localStorage:", err);
      alert("Failed to delete stored user.");
    }
  };

  const editUsers = (id) => {
    const pathname = "/";
    const url = `${pathname}?editId=${encodeURIComponent(id)}&source=storedUsers`;
    window.location.href = url;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-3xl font-bold mt-10">Users</h3>

      <div className="mt-6 bg-white p-6 rounded shadow">
        {storedUsers.length === 0 && <p>No Users data</p>}

        {storedUsers.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">S.No.</th>
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Gender</th>
                <th className="py-2">Hobbies</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {storedUsers.map((s, index) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{s.id}</td>
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">{s.gender || "—"}</td>
                  <td className="py-2">{s.hobbies && s.hobbies.length ? s.hobbies.join(", ") : "—"}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => editUsers(s.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded-lg mr-2">Edit</button>
                    <button type="button" onClick={() => deleteUsers(s.id)} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserList;
