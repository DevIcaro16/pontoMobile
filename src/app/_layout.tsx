import { initializeDatabase } from "@/database/initializeDatabaseOld";
import { Slot } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

export default function Layout() {
  return (
    <SQLiteProvider
      databaseName="expert_db.db"
      onInit={initializeDatabase}
    >
      <Slot />
    </SQLiteProvider>
  );
} 