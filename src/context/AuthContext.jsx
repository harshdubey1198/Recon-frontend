// import React, { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   // persist user in localStorage so refresh keeps login for UI testing
//   const [user, setUser] = useState(() => {
//     try {
//       const raw = localStorage.getItem("auth_user");
//       return raw ? JSON.parse(raw) : null;
//     } catch {
//       return null;
//     }
//   });

//   useEffect(() => {
//     if (user) localStorage.setItem("auth_user", JSON.stringify(user));
//     else localStorage.removeItem("auth_user");
//   }, [user]);

//   const login = (userData) => {
//     // userData can be { email, name, token } when real API is plugged
//     setUser(userData);
//   };

  

//    const logout = () => {
//     // ✅ Clear storage
//     localStorage.removeItem("auth_user");
//     sessionStorage.removeItem("accessToken"); 
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // custom hook for convenience
// export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);

  // persist both user and token
  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }, [token]);

  const login = (userData) => {
    // Example userData = { email, name, token }
    setUser(userData);
    if (userData?.token) setToken(userData.token);
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
