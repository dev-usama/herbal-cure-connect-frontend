import './App.css'
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Meeting from './components/Meeting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meeting/:roomId" element={<Meeting />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
