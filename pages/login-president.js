// pages/login-president.js
import { useState } from 'react';

export default function LoginPresident() {
    const [dni, setDni] = useState('');
    const [mesaId, setMesaId] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!dni || !mesaId) {
            alert('Por favor complete DNI y código de mesa');
            return;
        }

        // Buscar la mesa en localStorage
        const pollingStations = JSON.parse(localStorage.getItem('pollingStations') || '[]');
        const today = new Date().toDateString();

        const mesa = pollingStations.find(station => {
            const stationDate = new Date(station.createdAt).toDateString();
            return stationDate === today &&
                station.id === parseInt(mesaId) &&
                station.presidentDNI === dni;
        });

        if (!mesa) {
            alert('❌ Credenciales inválidas. Verifique:\n• DNI del presidente\n• Código de mesa\n• Que la mesa esté asignada a usted');
            return;
        }

        if (!mesa.isOpen) {
            alert('❌ La mesa no está abierta. Contacte al administrador.');
            return;
        }

        // Guardar sesión de presidente
        const presidentSession = {
            role: 'president',
            mesaId: mesa.id,
            mesaName: mesa.name,
            location: mesa.location,
            presidentDNI: dni,
            presidentName: mesa.president,
            loggedInAt: new Date().toISOString()
        };

        localStorage.setItem('presidentSession', JSON.stringify(presidentSession));
        window.location.href = '/president';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Acceso Presidentes de Mesa
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ingrese sus credenciales proporcionadas por el administrador
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
                                DNI del Presidente
                            </label>
                            <div className="mt-1">
                                <input
                                    id="dni"
                                    name="dni"
                                    type="text"
                                    required
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="12345678"
                                    maxLength="8"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mesaId" className="block text-sm font-medium text-gray-700">
                                Código de Mesa
                            </label>
                            <div className="mt-1">
                                <input
                                    id="mesaId"
                                    name="mesaId"
                                    type="text"
                                    required
                                    value={mesaId}
                                    onChange={(e) => setMesaId(e.target.value.replace(/\D/g, ''))}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Código numérico de la mesa"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Proporcionado por el administrador al crear la mesa
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Ingresar al Sistema
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Información importante
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                <strong>⚠️ Requisitos para acceder:</strong>
                            </p>
                            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                                <li>DNI debe coincidir con el asignado a la mesa</li>
                                <li>La mesa debe estar abierta por el administrador</li>
                                <li>Solo puede acceder durante el horario de votación</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}