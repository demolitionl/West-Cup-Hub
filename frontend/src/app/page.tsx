'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://west-cup-hub-back-end.onrender.com');

export default function Home() {
  const [name, setName] = useState('');
  const [queue, setQueue] = useState<string[]>([]);
  const [myName, setMyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('queue-updated', (data: string[]) => {
      setQueue(data);
    });

    socket.on('join-error', (msg: string) => {
      setError(msg);
    });

    return () => {
      socket.off('queue-updated');
      socket.off('join-error');
    };
  }, []);

  const joinQueue = () => {
    if (!name.trim()) return;
    if (myName && queue.includes(myName)) {
      setError('Você já está na fila. Remova seu nome antes de adicionar outro.');
      return;
    }

    setError('');
    socket.emit('join-queue', name);
    setMyName(name);
    setName('');
  };

  const leaveQueue = (target: string) => {
    if (target === myName) {
      socket.emit('leave-queue', target);
      setMyName('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold text-blue-400">Fila 5x5</h1>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Digite seu nome"
          className="p-3 w-72 rounded bg-white text-black outline-none text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={joinQueue}
          disabled={Boolean(myName && queue.includes(myName))}
          className={`px-5 py-3 rounded text-lg ${
            myName && queue.includes(myName)
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          Entrar na Fila
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      <div className="max-w-md w-full mt-4">
        <h2 className="text-2xl mb-2">Jogadores na fila:</h2>
        <ul className="bg-gray-800 p-4 rounded shadow space-y-2">
          {queue.map((player, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b border-gray-700 py-2 px-2 text-lg"
            >
              <span className={player === myName ? 'text-green-400 font-bold' : ''}>
                {idx + 1}. {player}
              </span>
              {player === myName && (
                <button
                  onClick={() => leaveQueue(player)}
                  className="text-red-400 hover:text-red-600 text-xl"
                  title="Sair da fila"
                >
                  ❌
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
