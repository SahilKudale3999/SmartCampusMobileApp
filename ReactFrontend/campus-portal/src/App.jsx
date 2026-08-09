import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageFaculty from './pages/admin/ManageFaculty'
import ManageStudents from './pages/admin/ManageStudents'
import ManageCourses from './pages/admin/ManageCourses'
import Subjects from './pages/admin/Subjects'
import Assignments from './pages/admin/Assignments'
import Submissions from './pages/admin/Submissions'
import Attendance from './pages/admin/Attendance'
import Events from './pages/admin/Events'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="faculty" element={<ManageFaculty />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="events" element={<Events />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App