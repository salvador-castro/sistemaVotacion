// components/admin/Dashboard.js
export default function AdminDashboard({ voters, pollingStations, votingConfig }) {
    // Calcular estadísticas
    const totalVoters = voters.length;
    const enabledVoters = voters.filter(v => v.enabled).length;
    const votedVoters = voters.filter(v => v.voted).length;
    const participation = totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0;

    // Calcular distribución REAL por sede basada en las mesas
    const getTodayStations = () => {
        if (!pollingStations || pollingStations.length === 0) return [];
        const today = new Date().toDateString();
        return pollingStations.filter(station => {
            const stationDate = new Date(station.createdAt).toDateString();
            return stationDate === today;
        });
    };

    const todayStations = getTodayStations();

    // Calcular votos por sede REALES
    const medranoVotes = todayStations
        .filter(station => station.location.toLowerCase().includes('medrano'))
        .reduce((total, station) => total + station.voters, 0);

    const campusVotes = todayStations
        .filter(station => station.location.toLowerCase().includes('campus'))
        .reduce((total, station) => total + station.voters, 0);

    const stats = {
        totalVoters,
        totalVotes: votedVoters,
        enabledVoters,
        disabledVoters: voters.filter(v => !v.enabled).length,
        participation,
        medranoVotes,
        campusVotes
    };

    const isVotingActive = () => {
        if (!votingConfig?.isEnabled) return false;

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5);

        if (!votingConfig.allowedDays.includes(currentDay)) return false;
        if (currentTime < votingConfig.startTime || currentTime > votingConfig.endTime) return false;

        if (votingConfig.startDate && votingConfig.endDate) {
            const start = new Date(votingConfig.startDate);
            const end = new Date(votingConfig.endDate);
            end.setHours(23, 59, 59);

            if (now < start || now > end) return false;
        }

        return true;
    };

    return (
        <div className="space-y-6">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800">Total Votantes</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalVoters}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800">Votos Emitidos</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalVotes}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800">Participación</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.participation}%</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-800">Habilitados</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.enabledVoters}</p>
                </div>
            </div>

            {/* Estado del Sistema y Mesas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Estado del Sistema</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Sistema de Votación</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isVotingActive()
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {isVotingActive() ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Mesas Abiertas</span>
                            <span className="text-lg font-semibold text-blue-600">
                                {todayStations.filter(s => s.isOpen).length}/{todayStations.length}
                            </span>
                        </div>
                        {votingConfig && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Horario:</strong> {votingConfig.startTime} - {votingConfig.endTime}
                                </p>
                                <p className="text-sm text-blue-800">
                                    <strong>Período:</strong> {votingConfig.startDate || 'No definido'} al {votingConfig.endDate || 'No definido'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Distribución por Sede - CORREGIDA */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Distribución por Sede</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Medrano</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {stats.medranoVotes} votos ({todayStations.filter(s => s.location.toLowerCase().includes('medrano')).length} mesas)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${stats.totalVotes > 0 ? (stats.medranoVotes / stats.totalVotes) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Campus</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {stats.campusVotes} votos ({todayStations.filter(s => s.location.toLowerCase().includes('campus')).length} mesas)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${stats.totalVotes > 0 ? (stats.campusVotes / stats.totalVotes) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        {stats.totalVotes === 0 && (
                            <p className="text-sm text-gray-500 text-center mt-2">
                                No hay votos registrados aún
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Resumen del Sistema */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Resumen del Sistema</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">Votantes inhabilitados:</span>
                        <span className="font-semibold text-red-600">{stats.disabledVoters}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">Votantes que ya votaron:</span>
                        <span className="font-semibold text-green-600">{stats.totalVotes}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">Mesas activas hoy:</span>
                        <span className="font-semibold text-gray-900">
                            {todayStations.filter(s => s.isOpen).length} de {todayStations.length}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">Votos en Medrano:</span>
                        <span className="font-semibold text-green-600">{stats.medranoVotes}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-700">Votos en Campus:</span>
                        <span className="font-semibold text-blue-600">{stats.campusVotes}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}