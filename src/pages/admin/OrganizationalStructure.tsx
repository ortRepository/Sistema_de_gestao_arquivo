import { useState } from "react";
import ManageDirectionsScreen from "./Directions";
import ManageSectionsScreen from "./Sections";
import DepartmentsScreen from "./Departments"; // Adjust path as needed
import ManageEntitiesScreen from "./Entities"; // Adjust path as needed
import ManageMenuBar from "@/components/common/ManageMenuBar";
export default function OrganizationalStructureScreen() {
  const [selectedTab, setSelectedTab] = useState<
    "Directions" | "Sections" | "Departments" | "Entities"
  >("Directions");

  return (
    <div>
      <ManageMenuBar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {selectedTab === "Directions" && <ManageDirectionsScreen />}
      {selectedTab === "Sections" && <ManageSectionsScreen />}
      {selectedTab === "Departments" && <DepartmentsScreen />}
      {selectedTab === "Entities" && <ManageEntitiesScreen />}
    </div>
  );
}
