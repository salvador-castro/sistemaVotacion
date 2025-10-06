// components/ui/Layout.js
import { useRouter } from 'next/router';

export default function Layout({ children, user }) {
    const router = useRouter();

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Sistema de Votación</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">
                            {user?.nombre} {user?.apellido} ({user?.role})
                        </span>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}