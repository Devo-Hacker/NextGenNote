import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextStore';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={logout}>Logout</button>
      <p>Notes will go here.</p>
    </div>
  );
};

export default Dashboard;