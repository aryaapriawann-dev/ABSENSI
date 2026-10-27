import React, { useState } from 'react';
import { UserPlus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord, Employee } from '../utils/attendanceLogic';

interface EmployeeDirectoryProps {
  employees: Employee[];
  records: AttendanceRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  records,
  onAddEmployee,
  onDeleteEmployee,
}) => {
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Operasional');
  const [role, setRole] = useState('');
  const [shiftStart, setShiftStart] = useState('08:30');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanNip = nip.trim();
    const cleanName = name.trim();
    const cleanRole = role.trim();

    if (!cleanNip || !cleanName || !cleanRole) {
      setError('NIP, Nama Lengkap, dan Jabatan wajib diisi.');
      return;
    }

    if (employees.some((emp) => emp.nip.toLowerCase() === cleanNip.toLowerCase())) {
      setError('Nomor Induk Pegawai (NIP) sudah terdaftar.');
      return;
    }

    onAddEmployee({
      nip: cleanNip,
      name: cleanName,
      department,
      role: cleanRole,
      shiftStart: shiftStart || '08:30',
    });

    setSuccess(`Karyawan ${cleanName} berhasil ditambahkan ke direktori.`);
    setNip('');
    setName('');
    setRole('');
  };

  return (
    <div className="space-y-8">
      {/* Form Tambah Karyawan */}
      <section
        aria-labelledby="tambah-karyawan-heading"
        className="bg-white border border-slate-200 rounded-xl p-6"
      >
        <h2
          id="tambah-karyawan-heading"
          className="text-lg font-semibold text-slate-900 tracking-tight"
        >
          Tambah Karyawan Baru
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Daftarkan personel baru agar dapat dicatat pada lembar absensi harian.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="emp-nip" className="block text-xs font-medium text-slate-700 mb-1.5">
              NIP
            </label>
            <input
              id="emp-nip"
              type="text"
              placeholder="102409"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="emp-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="emp-name"
              type="text"
              placeholder="Contoh: Arif Budiman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="emp-dept" className="block text-xs font-medium text-slate-700 mb-1.5">
              Divisi
            </label>
            <select
              id="emp-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Operasional">Operasional</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Keuangan">Keuangan</option>
              <option value="SDM & Umum">SDM & Umum</option>
              <option value="Pemasaran">Pemasaran</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="emp-role" className="block text-xs font-medium text-slate-700 mb-1.5">
              Jabatan / Peran
            </label>
            <input
              id="emp-role"
              type="text"
              placeholder="Contoh: Analis Data"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-10 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}
      </section>

      {/* Tabel Direktori Karyawan */}
      <section
        aria-labelledby="direktori-karyawan-heading"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="direktori-karyawan-heading"
              className="text-lg font-semibold text-slate-900 tracking-tight"
            >
              Direktori Karyawan Aktif
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total <span className="font-mono tabular-nums font-medium text-slate-800">{employees.length}</span> karyawan terdaftar
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-4 font-medium">NIP</th>
                <th className="py-3 px-4 font-medium">Nama Lengkap</th>
                <th className="py-3 px-4 font-medium">Divisi & Jabatan</th>
                <th className="py-3 px-4 font-medium text-right">Jadwal Masuk</th>
                <th className="py-3 px-4 font-medium text-right">Total Hadir</th>
                <th className="py-3 px-4 font-medium text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {employees.map((emp) => {
                const empRecords = records.filter((r) => r.employeeId === emp.id);
                const hadirCount = empRecords.filter((r) => r.status === 'Hadir').length;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600">
                      {emp.nip}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <span>{emp.department}</span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
                      <span className="text-slate-500">{emp.role}</span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-700 text-right">
                      {emp.shiftStart}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-800 text-right">
                      {hadirCount} hari
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteEmployee(emp.id)}
                        aria-label={`Hapus karyawan ${emp.name}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
