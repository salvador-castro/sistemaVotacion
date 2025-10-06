// pages/test-db.js
import { useEffect, useState } from 'react';

export default function TestDB() {
  const [message, setMessage] = useState('Probando base de datos...');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function testDB() {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();

        if (data.success) {
          setMessage(data.message);
          setUsers(data.users || []);
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        setMessage(`Error de conexión: ${error.message}`);
      }
    }

    testDB();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba de Base de Datos</h1>
      <p className="mb-4">{message}</p>

      {users.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Usuarios del sistema:</h2>
          <ul className="list-disc pl-6">
            {users.map(user => (
              <li key={user.dni}>
                {user.nombre} {user.apellido} - {user.role} (DNI: {user.dni})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}