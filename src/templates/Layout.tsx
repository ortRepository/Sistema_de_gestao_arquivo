// src/templates/Layout.tsx
import { Outlet } from "react-router-dom";

// import { useState, useEffect } from "react";
// import Spinner from "@/components/spinner";

export default function Layout() {
  // const location = useLocation();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);

  //   return () => clearTimeout(timeout);
  // }, [location]);


  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}
