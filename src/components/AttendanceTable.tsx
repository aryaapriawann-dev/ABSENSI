import React from 'react';
import {
  Search,
  LogOut,
  Trash2,
  RotateCcw,
  Download,
} from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  calculateWorkDuration,
} from '../utils/attendanceLogic';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'Semua' | AttendanceStatus | 'Terlambat';
  onStatusFilterChange: (s: 'Semua' | AttendanceStatus | 'Terlambat') => void;
  departmentFilter: string;
  onDepartmentFilterChange: (d: string) => void;
  departments: string[];
  onCheckOut: (recordId: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onResetFilters: () => void;
  onExportCsv: () => void;
}

const FILTER_TABS: Array<'Semua' | AttendanceStatus | 'Terlambat'> = [
  'Semua',
  'Hadir',
  'Terlambat',
  'Izin',
  'Sakit',
  'Cuti',
  'Alpa',
];

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  onCheckOut,
  onDeleteRecord,
  onResetFilters,
  onExportCsv,
}) => {
  const renderStatusText = (record: AttendanceRecord) => {
    if (record.status === 'Hadir') {
      if (record.isLate) {
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-amber-700">Hadir</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-amber-700 font-mono tabular-nums">
              Terlambat {record.lateMinutes}m
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-emerald-700">Hadir</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-600">Tepat Waktu</span>
        </div>
      );
    }

    if (record.status === 'Izin' || record.status === 'Cuti') {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-sky-700">{record.status}</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-500">Terjadwal</span>
        </div>
      );
    }

    if (record.status === 'Sakit') {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-amber-700">Sakit</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-500">Istirahat Medis</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-semibold text-red-700">Alpa</span>
        <span aria-hidden="true" className="text-slate-400">·</span>
        <span className="text-red-600">Tanpa Keterangan</span>
      </div>
    );
  };

  return (
    <section
      aria-labelledby="daftar-absensi-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Toolbar Header */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2
              id="daftar-absensi-heading"
              className="text-lg font-semibold text-slate-900 tracking-tight"
            >
              Daftar Kehadiran Harian
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-mono tabular-nums font-medium text-slate-800">{records.length}</span> entri kehadiran sesuai filter aktif
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Cari nama karyawan, NIP, atau catatan"
                placeholder="Cari nama, NIP, divisi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Department Filter */}
            <select
              aria-label="Filter Divisi"
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Semua">Semua Divisi</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCsv}
              className="h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Interactive Filter Controls (Segmented Tabs) */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 sm:pb-0">
          <div
            role="tablist"
            aria-label="Filter berdasarkan status kehadiran"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            {FILTER_TABS.map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => onStatusFilterChange(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {records.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Tidak ada data kehadiran yang cocok
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Belum ada catatan absensi untuk filter yang dipilih, atau kata kunci pencarian tidak ditemukan.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter Pencarian</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">NIP</th>
                <th className="py-3 px-4 font-medium">Nama Karyawan</th>
                <th className="py-3 px-4 font-medium">Status & Keterangan</th>
                <th className="py-3 px-4 font-medium text-right">Jam Masuk</th>
                <th className="py-3 px-4 font-medium text-right">Jam Pulang</th>
                <th className="py-3 px-4 font-medium text-right">Durasi</th>
                <th className="py-3 px-4 font-medium">Catatan Harian</th>
                <th className="py-3 px-4 font-medium text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {records.map((rec) => {
                const duration = calculateWorkDuration(rec.checkIn, rec.checkOut);
                const canCheckOut = rec.status === 'Hadir' && !rec.checkOut;

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap">
                      {rec.nip}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {rec.employeeName}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{rec.department}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.workMode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatusText(rec)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-800 text-right whitespace-nowrap">
                      {rec.checkIn ?? '—'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-800 text-right whitespace-nowrap">
                      {rec.checkOut ?? '—'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 text-right whitespace-nowrap">
                      {duration}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        {canCheckOut && (
                          <button
                            type="button"
                            onClick={() => onCheckOut(rec.id)}
                            aria-label={`Absen pulang ${rec.employeeName}`}
                            className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Absen Pulang</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          aria-label={`Hapus absensi ${rec.employeeName}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
