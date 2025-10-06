
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/userContext";

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}
