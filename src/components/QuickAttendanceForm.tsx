import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  AttendanceStatus,
  Employee,
  NewAttendanceInput,
  WorkMode,
  validateAttendanceInput,
} from '../utils/attendanceLogic';

interface QuickAttendanceFormProps {
  employees: Employee[];
  selectedDate: string;
  onAddAttendance: (input: NewAttendanceInput) => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Cuti', 'Alpa'];
const WORK_MODES: WorkMode[] = ['WFO', 'WFH', 'Lapangan'];

export const QuickAttendanceForm: React.FC<QuickAttendanceFormProps> = ({
  employees,
  selectedDate,
  onAddAttendance,
}) => {
  const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id ?? '');
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [workMode, setWorkMode] = useState<WorkMode>('WFO');
  const [checkIn, setCheckIn] = useState<string>('08:15');
  const [checkOut, setCheckOut] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetCurrentTime = (field: 'checkIn' | 'checkOut') => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const formatted = `${hh}:${mm}`;
    if (field === 'checkIn') {
      setCheckIn(formatted);
    } else {
      setCheckOut(formatted);
    }
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: NewAttendanceInput = {
      employeeId,
      date: selectedDate,
      status,
      workMode,
      checkIn: status === 'Hadir' ? checkIn : '',
      checkOut: status === 'Hadir' ? checkOut : '',
      notes: notes.trim(),
    };

    const validation = validateAttendanceInput(payload, employees);
    if (!validation.valid) {
      setErrorMsg(validation.error ?? 'Data tidak valid.');
      return;
    }

    onAddAttendance(payload);
    const emp = employees.find((item) => item.id === employeeId);
    setSuccessMsg(`Absensi ${emp?.name ?? 'karyawan'} berhasil dicatat.`);
    setNotes('');
    setCheckOut('');
  };

  return (
    <section
      aria-labelledby="form-absensi-heading"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-slate-200">
        <div>
          <h2
            id="form-absensi-heading"
            className="text-lg font-semibold text-slate-900 tracking-tight"
          >
            Catat Kehadiran Karyawan
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Pilih nama karyawan, status kehadiran, dan jam masuk untuk tanggal{' '}
            <span className="font-mono tabular-nums text-slate-900 font-medium">
              {selectedDate}
            </span>
            . Batas jam masuk normal adalah <span className="font-mono tabular-nums">08:30</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Pilih Karyawan */}
          <div className="md:col-span-4">
            <label
              htmlFor="select-karyawan"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Nama Karyawan
            </label>
            <select
              id="select-karyawan"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nip} — {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Status Kehadiran */}
          <div className="md:col-span-4">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Status Kehadiran
            </span>
            <div
              role="group"
              aria-label="Pilih Status Kehadiran"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg h-10"
            >
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setStatus(opt);
                      setErrorMsg(null);
                    }}
                    className={`flex-1 h-8 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Kerja */}
          <div className="md:col-span-4">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Lokasi / Mode Kerja
            </span>
            <div
              role="group"
              aria-label="Pilih Mode Kerja"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg h-10"
            >
              {WORK_MODES.map((mode) => {
                const active = workMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkMode(mode)}
                    className={`flex-1 h-8 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Jam Masuk */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="input-jam-masuk"
                className="text-xs font-medium text-slate-700"
              >
                Jam Masuk (HH:mm)
              </label>
              {status === 'Hadir' && (
                <button
                  type="button"
                  onClick={() => handleSetCurrentTime('checkIn')}
                  className="text-xs text-slate-600 hover:text-slate-900 underline whitespace-nowrap shrink-0"
                >
                  Sekarang
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="input-jam-masuk"
                type="text"
                placeholder="08:15"
                disabled={status !== 'Hadir'}
                value={status === 'Hadir' ? checkIn : '—'}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Jam Pulang (Opsional) */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="input-jam-pulang"
                className="text-xs font-medium text-slate-700"
              >
                Jam Pulang (Opsional)
              </label>
              {status === 'Hadir' && (
                <button
                  type="button"
                  onClick={() => handleSetCurrentTime('checkOut')}
                  className="text-xs text-slate-600 hover:text-slate-900 underline whitespace-nowrap shrink-0"
                >
                  Sekarang
                </button>
              )}
            </div>
            <input
              id="input-jam-pulang"
              type="text"
              placeholder="17:00"
              disabled={status !== 'Hadir'}
              value={status === 'Hadir' ? checkOut : ''}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Catatan / Keterangan */}
          <div className="md:col-span-4">
            <label
              htmlFor="input-catatan"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Catatan / Aktivitas Harian
            </label>
            <input
              id="input-catatan"
              type="text"
              placeholder="Contoh: Rapat koordinasi pagi / Surat dokter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-10 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Simpan Absen</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>
    </section>
  );
};
