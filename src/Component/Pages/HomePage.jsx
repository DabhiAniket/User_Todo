import React, { useEffect, useState, useCallback, useMemo  } from "react";

const parseJsonSafe = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("JSON parse error:", e);
    return null;
  }
};

const g_Id = () => Math.random().toString(36).slice(2, 7);

const mergeUsers = (base = [], extra = []) => {
  const map = new Map();
  (Array.isArray(base) ? base : []).forEach((u) => {
    if (!u) return;
    const id = String(u.id);
    map.set(id, { ...u, id });
  });

  (Array.isArray(extra) ? extra : []).forEach((u) => {
    if (!u) return;
    const id = String(u.id);
    if (!map.has(id)) map.set(id, { ...u, id });
  });
  return Array.from(map.values());
};

const useLocalUsers = () => {
  
  const [users, setUsers] = useState(() => {
    const raw = localStorage.getItem("users");
    const parsed = parseJsonSafe(raw);
    return Array.isArray(parsed) ? parsed.map(u => ({ ...u, id: String(u.id) })) : [];
  });

  const [storedUsers, setStoredUsers] = useState(() => {
    const raw = localStorage.getItem("storedUsers");
    const parsed = parseJsonSafe(raw);
    return Array.isArray(parsed) ? parsed.map(u => ({ ...u, id: String(u.id) })) : [];
  });

  
  useEffect(() => {
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch (err) {
      console.error("Failed to write users to localStorage:", err);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("storedUsers", JSON.stringify(storedUsers));
    } catch (err) {
      console.error("Failed to write storedUsers to localStorage:", err);
    }
  }, [storedUsers]);

  
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "users") {
        const parsed = parseJsonSafe(e.newValue);
        if (Array.isArray(parsed)) {
          setUsers(parsed.map(u => ({ ...u, id: String(u.id) })));
        } else {
          setUsers([]);
        }
      }

      if (e.key === "storedUsers") {
        const parsed = parseJsonSafe(e.newValue);
        if (Array.isArray(parsed)) {
          setStoredUsers(parsed.map(u => ({ ...u, id: String(u.id) })));
        } else {
          setStoredUsers([]);
        }
      }
    };

    const updateUser = (evt) => {
      const updated = evt?.detail;
      if (Array.isArray(updated)) {
        setStoredUsers(updated.map(u => ({ ...u, id: String(u.id) })));
      } else {
        const raw = localStorage.getItem("storedUsers");
        const parsed = parseJsonSafe(raw);
        if (Array.isArray(parsed)) setStoredUsers(parsed.map(u => ({ ...u, id: String(u.id) })));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("storedUsersUpdated", updateUser);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("storedUsersUpdated", updateUser);
    };
  }, []);

  return { users, setUsers, storedUsers, setStoredUsers };
};

const HomePage = () => {
  const { users, setUsers, storedUsers, setStoredUsers } = useLocalUsers();

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [editing, setEditing] = useState(null); 
  const [search, setSearch] = useState(""); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editIdRaw = params.get("editId");
    const source = params.get("source");
    if (!editIdRaw) return;
    const id = String(editIdRaw);

    if (source === "storedUsers") {
      const raw = localStorage.getItem("storedUsers");
      const parsed = parseJsonSafe(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find((u) => String(u.id) === id);
        if (found) {
          beginEdit(found, "storedUsers");
          params.delete("editId");
          params.delete("source");
          const base = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState({}, "", base);
        }
      }
    } 
    else
    {
      const raw = localStorage.getItem("users");
      const parsed = parseJsonSafe(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find((u) => String(u.id) === id);
        if (found) {
          beginEdit(found, "users");
          params.delete("editId");
          params.delete("source");
          const base = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState({}, "", base);
        }
      }
    }
  }, []);

  const hobbyChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setHobbies((prev) => (prev.includes(value) ? prev : [...prev, value]));
    } else {
      setHobbies((prev) => prev.filter((h) => h !== value));
    }
  };

  const resetForm = () => {
    setName("");
    setGender("");
    setHobbies([]);
  };

  const beginEdit = (user, source = "users") => {
    setEditing({ id: String(user.id), source });
    setName(user.name || "");
    setGender(user.gender || "");
    setHobbies(Array.isArray(user.hobbies) ? [...user.hobbies] : []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null);
    resetForm();
  };

  const addOrUpdateUser = (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      alert("Please enter a name.");
      return;
    }

    const normalized = {
      id: editing ? String(editing.id) : g_Id(),
      name: name.trim(),
      gender,
      hobbies: [...hobbies],
    };

    if (editing && editing.source === "users") 
    {
      setUsers((prev) => prev.map((u) => (String(u.id) === String(editing.id) ? normalized : u)));
      alert("User updated.");
    } 
    else if (editing && editing.source === "storedUsers") 
    {
      try {
        const raw = localStorage.getItem("storedUsers");
        let arr = parseJsonSafe(raw);
        if (!Array.isArray(arr)) arr = [];
        const updatedStored = arr.some((u) => String(u.id) === normalized.id) ? arr.map((u) => (String(u.id) === normalized.id ? normalized : u)) : [...arr, normalized];
        setStoredUsers(updatedStored.map(u => ({ ...u, id: String(u.id) })));
        
        localStorage.setItem("storedUsers", JSON.stringify(updatedStored));
        window.dispatchEvent(new CustomEvent("storedUsersUpdated", { detail: updatedStored }));
        alert("Stored user updated.");
      } 
      catch (err) 
      {
        console.error(err);
        alert("Failed to save stored user.");
      }
    } 
    else 
    {
      setUsers((prev) => [...prev, normalized]);
      alert("User added in user List");
    }

    setEditing(null);
    resetForm();
  };

  const storeSingleUser = useCallback((user) => {
    if (!user || typeof user !== "object") {
      console.warn("storeSingleUser must be called with a user object");
      return;
    }
    const normalized = { ...user, id: String(user.id) };

    try 
    {
      setUsers((prev) => prev.filter((u) => String(u.id) !== normalized.id));

      const raw = localStorage.getItem("storedUsers");
      let stored = parseJsonSafe(raw);
      if (!Array.isArray(stored)) stored = [];
      const exists = stored.some((u) => String(u.id) === normalized.id);
      const updated = exists ? stored.map((u) => (String(u.id) === normalized.id ? normalized : u)) : [...stored, normalized];

      setStoredUsers(updated.map(u => ({ ...u, id: String(u.id) })));
      localStorage.setItem("storedUsers", JSON.stringify(updated));
      
      window.dispatchEvent(new CustomEvent("storedUsersUpdated", { detail: updated }));
      alert(`User "${normalized.name}" moved to stored users.`);
    } 
    catch (err) 
    {
      console.error(err);
      alert("Failed to store user. See console.");
    }
  }, [setUsers, setStoredUsers]);


  const DeleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
  };


  const SearchUser = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.name || "").toLowerCase().includes(q));
  }, [users, search]);


  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold text-indigo-700 text-center">Users</h2>

      <h3 className="text-3xl font-bold mt-10">{editing ? `Edit User (${editing.source})` : "Add User"}</h3>
      <form onSubmit={addOrUpdateUser} className="bg-white shadow-md p-6 mt-10 rounded-lg">
        <label className="text-2xl w-full block"> Name
          <input type="text" value={name} placeholder="Enter name" onChange={(e) => setName(e.target.value)} className="border-2 border-indigo-400 rounded-xl w-full p-2 mt-2" />
        </label>

        <fieldset className="text-2xl w-full mt-4">
           Gender
          <div className="mt-2">
            <label className="mr-6">
              <input type="radio" name="gender" value="Male" checked={gender === "Male"} onChange={(e) => setGender(e.target.value)} /> Male
            </label>
            <label>
              <input type="radio" name="gender" value="Female" checked={gender === "Female"} onChange={(e) => setGender(e.target.value)} /> Female
            </label>
          </div>
        </fieldset>

        <fieldset className="text-2xl w-full mt-4">
          Hobbies:
          <div className="mt-2 flex gap-4 flex-wrap">
            {["Music", "Sports", "Reading", "Gaming", "Travel"].map((hobby) => (
              <label key={hobby}>
                <input type="checkbox" value={hobby} checked={hobbies.includes(hobby)} onChange={hobbyChange} /> {hobby}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-800 text-white px-4 py-2 rounded mt-6">
            {editing ? (editing.source === "storedUsers" ? "Save StoredUser" : "Save") : "Add User"}
          </button>

          <button className="bg-indigo-500 hover:bg-indigo-800 text-white px-4 py-2 rounded mt-6"
            type="button" onClick={() => { const userToStore = editing && editing.source === "users" ? { id: editing.id, name: name.trim(), gender, hobbies: [...hobbies] } : { id: g_Id(), name: name.trim(), gender, hobbies: [...hobbies] };
              if (!userToStore.name) 
              { 
                alert("Please enter a name to store."); 
                return; 
              }
              
              storeSingleUser(userToStore);
              setEditing(null);
              resetForm();
            }} >
            Store User
          </button>

          <button type="button" onClick={cancelEdit} className="bg-indigo-500 hover:bg-indigo-800 text-white px-4 py-2 rounded mt-6">Clear</button>
        </div>
      </form>

      
      <h3 className="text-3xl font-bold mt-10">Users List </h3>
      <div className="w-full flex justify-end p-4">
        <input type="text" placeholder="Search name" value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 border-indigo-400 rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md" />
      </div>

      <div className="mt-6 bg-white p-6 rounded shadow">
        {users.length === 0 && <p>No users data</p>}

        {users.length > 0 && (
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
              {SearchUser.map((u, index) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{u.id}</td>
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.gender}</td>
                  <td className="py-2">{u.hobbies && u.hobbies.length ? u.hobbies.join(", ") : "—"}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => storeSingleUser(u)} className="bg-indigo-600 hover:bg-indigo-800 text-white font-medium py-2 px-3 rounded-lg mr-2">Store</button>
                    <button type="button" onClick={() => beginEdit(u, "users")} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded-lg mr-2">Edit</button>
                    <button type="button" onClick={() => DeleteUser(u.id)} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg">Delete</button>
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

export default HomePage;
