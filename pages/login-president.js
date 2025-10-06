// pages/login-president.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPresident() {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Primero verificar si el período de votación está activo
            const votingStatusResponse = await fetch('/api/check-voting-period');
            const votingStatus = await votingStatusResponse.json();

            if (!votingStatus.active) {
                setError(`⏰ ${votingStatus.reason}`);
                setLoading(false);
                return;
            }

            // Si el período está activo, proceder con el login
            const response = await fetch('/api/auth/president', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dni, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                // Redirigir al panel del presidente
                router.push('/president-dashboard');
            } else {
                setError(data.error || 'Error en el login');
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Acceso Presidente de Mesa
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ingrese sus credenciales para acceder al sistema
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="dni" className="sr-only">
                                DNI
                            </label>
                            <input
                                id="dni"
                                name="dni"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Ingresar'}
                        </button>
                    </div>
                </form>

                {/* Información del período de votación */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Período de Votación</h3>
                    <p className="text-xs text-blue-600 mt-1">
                        Solo puede acceder durante el período y horario establecido para la votación.
                    </p>
                </div>
            </div>
        </div>
    );
}