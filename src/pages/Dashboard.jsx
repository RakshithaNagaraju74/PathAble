import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
      else navigate('/'); // Redirect to login if not signed in
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) return null; // or loading spinner

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.displayName || 'User'} 👋</h1>
        <p className="text-sm text-gray-600 mb-6">Email: {user.email}</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/map')}
            className="bg-[#007EA7] hover:bg-[#006085] text-white py-3 rounded-md font-medium transition"
          >
            Go to Map 🗺️
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium transition"
          >
            Logout 🔒
          </button>
        </div>
      </div>
    </div>
  );
}
