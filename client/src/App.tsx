import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import { useSocketSync } from './socket/socket.hooks';
import { socket } from './socket/socket.client';
import { LocalGameProvider } from './context/LocalGameContext';
import { useLocalGame } from './context/LocalGameContext';
import LoginPage from './pages/local/LoginPage';
import SetupPage from './pages/local/SetupPage';
import LocalGamePage from './pages/local/LocalGamePage';

function LocalInner() {
  const { state } = useLocalGame();
  if (state.appPhase === 'login') return <LoginPage />;
  if (state.appPhase === 'setup') return <SetupPage />;
  return <LocalGamePage />;
}

function LocalApp() {
  return (
    <LocalGameProvider>
      <LocalInner />
    </LocalGameProvider>
  );
}

export default function App() {
  useSocketSync();

  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/local" element={<LocalApp />} />
        <Route path="/room/:roomId" element={<LobbyPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
