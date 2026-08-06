import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./app/AuthContext";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import ResourcePage from "./features/resources/pages/ResourcePage";
import { resources } from "./features/resources/resourceDefinitions";

function Protected({ children }) { const { authenticated } = useAuth(); return authenticated ? children : <Navigate to="/login" replace />; }
function RoleRoute({ resource }) { const { user } = useAuth(); return resource.roles.includes(user?.role) ? <ResourcePage resource={resource} /> : <Navigate to="/" replace />; }
export default function App() { return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<Protected><AppLayout /></Protected>}><Route index element={<DashboardPage />} />{resources.map((resource) => <Route key={resource.key} path={resource.path} element={<RoleRoute resource={resource} />} />)}</Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>; }
