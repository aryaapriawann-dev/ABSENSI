import React from 'react';
import { Download } from 'lucide-react';
import { AttendanceRecord, Employee } from '../utils/attendanceLogic';

interface RecapReportProps {
  employees: Employee[];
  records: AttendanceRecord[];
  onExportCsv: () => void;
}

export const RecapReport: React.FC<RecapReportProps> = ({
  employees,
  records,
  onExportCsv,
}) => {
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  return (
    <div className="space-y-8">
      {/* Ringkasan Per Divisi */}
      <section
        aria-labelledby="rekap-divisi-heading"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2
              id="rekap-divisi-heading"
              className="text-lg font-semibold text-slate-900 tracking-tight"
            >
              Rekapitulasi Kehadiran Per Divisi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan tingkat kehadiran, ketepatan waktu, dan ketidakhadiran antar unit kerja
            </p>
          </div>
          <button
            type="button"
            onClick={onExportCsv}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Laporan CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">Nama Divisi</th>
                <th className="py-3 px-4 font-medium text-right">Jumlah Personel</th>
                <th className="py-3 px-4 font-medium text-right">Hadir Tepat Waktu</th>
                <th className="py-3 px-4 font-medium text-right">Hadir Terlambat</th>
                <th className="py-3 px-4 font-medium text-right">Izin / Sakit / Cuti</th>
                <th className="py-3 px-4 font-medium text-right">Alpa</th>
                <th className="py-3 px-4 font-medium text-right">Rasio Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {departments.map((dept) => {
                const deptEmployees = employees.filter((e) => e.department === dept);
                const deptRecords = records.filter((r) => r.department === dept);
                const hadirTepat = deptRecords.filter(
                  (r) => r.status === 'Hadir' && !r.isLate
                ).length;
                const hadirLambat = deptRecords.filter(
                  (r) => r.status === 'Hadir' && r.isLate
                ).length;
                const izinSakitCuti = deptRecords.filter(
                  (r) => r.status === 'Izin' || r.status === 'Sakit' || r.status === 'Cuti'
                ).length;
                const alpa = deptRecords.filter((r) => r.status === 'Alpa').length;
                const total = deptRecords.length;
                const rate =
                  total > 0 ? Math.round(((hadirTepat + hadirLambat) / total) * 100) : 0;

                return (
                  <tr key={dept} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{dept}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 text-right">
                      {deptEmployees.length} orang
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-emerald-700 text-right">
                      {hadirTepat}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-amber-700 text-right">
                      {hadirLambat}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 text-right">
                      {izinSakitCuti}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-red-600 text-right">
                      {alpa}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-slate-900 text-right">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rekap Individual */}
      <section
        aria-labelledby="rekap-individu-heading"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <h2
            id="rekap-individu-heading"
            className="text-lg font-semibold text-slate-900 tracking-tight"
          >
            Matriks Kehadiran Per Karyawan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi riwayat absensi seluruh personel yang tercatat di sistem
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">NIP</th>
                <th className="py-3 px-4 font-medium">Nama Karyawan</th>
                <th className="py-3 px-4 font-medium">Divisi</th>
                <th className="py-3 px-4 font-medium text-right">Hadir</th>
                <th className="py-3 px-4 font-medium text-right">Terlambat</th>
                <th className="py-3 px-4 font-medium text-right">Izin / Sakit</th>
                <th className="py-3 px-4 font-medium text-right">Total Entri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {employees.map((emp) => {
                const empRecords = records.filter((r) => r.employeeId === emp.id);
                const hadir = empRecords.filter((r) => r.status === 'Hadir').length;
                const lambat = empRecords.filter(
                  (r) => r.status === 'Hadir' && r.isLate
                ).length;
                const izinSakit = empRecords.filter(
                  (r) => r.status !== 'Hadir' && r.status !== 'Alpa'
                ).length;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600">
                      {emp.nip}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{emp.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{emp.department}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-emerald-700 text-right">
                      {hadir}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-amber-700 text-right">
                      {lambat}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 text-right">
                      {izinSakit}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs font-medium text-slate-900 text-right">
                      {empRecords.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
