/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, RotateCcw } from 'lucide-react';
import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
  INITIAL_EMPLOYEES,
  NewAttendanceInput,
  calculateAttendanceSummary,
  evaluateLateness,
  filterAttendanceRecords,
  generateCsvContent,
  getSeedAttendanceRecords,
  getTodayIsoDate,
} from './utils/attendanceLogic';
import { QuickAttendanceForm } from './components/QuickAttendanceForm';
import { AttendanceTable } from './components/AttendanceTable';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { RecapReport } from './components/RecapReport';

type ActiveSection = 'absensi' | 'karyawan' | 'rekap' | 'panduan';

const STORAGE_KEYS = {
  RECORDS: 'hadirku_attendance_records_v1',
  EMPLOYEES: 'hadirku_employees_v1',
};

export default function App() {
  const todayIso = useMemo(() => getTodayIsoDate(), []);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_EMPLOYEES;
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return getSeedAttendanceRecords(todayIso);
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>('absensi');
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | AttendanceStatus | 'Terlambat'>('Semua');
  const [departmentFilter, setDepartmentFilter] = useState<string>('Semua');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch {
      // ignore storage errors
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch {
      // ignore storage errors
    }
  }, [records]);

  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department)));
  }, [employees]);

  const dateFilteredRecords = useMemo(() => {
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  const summary = useMemo(() => {
    return calculateAttendanceSummary(dateFilteredRecords);
  }, [dateFilteredRecords]);

  const visibleRecords = useMemo(() => {
    return filterAttendanceRecords(dateFilteredRecords, {
      searchQuery,
      statusFilter,
      departmentFilter,
    });
  }, [dateFilteredRecords, searchQuery, statusFilter, departmentFilter]);

  const handleAddAttendance = (input: NewAttendanceInput) => {
    const emp = employees.find((e) => e.id === input.employeeId);
    if (!emp) return;

    const checkInVal = input.status === 'Hadir' ? input.checkIn.trim() : null;
    const checkOutVal =
      input.status === 'Hadir' && input.checkOut.trim() !== ''
        ? input.checkOut.trim()
        : null;

    const { isLate, lateMinutes } = evaluateLateness(
      checkInVal,
      input.status,
      emp.shiftStart
    );

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      nip: emp.nip,
      employeeName: emp.name,
      department: emp.department,
      date: input.date,
      checkIn: checkInVal,
      checkOut: checkOutVal,
      status: input.status,
      workMode: input.workMode,
      isLate,
      lateMinutes,
      notes: input.notes,
    };

    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleCheckOut = (recordId: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentOut = `${hh}:${mm}`;

    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        const fallbackOut =
          rec.checkIn && currentOut < rec.checkIn ? '17:05' : currentOut;
        return {
          ...rec,
          checkOut: fallbackOut,
        };
      })
    );
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('Semua');
    setDepartmentFilter('Semua');
  };

  const handleResetDemoData = () => {
    const seedEmps = INITIAL_EMPLOYEES;
    const seedRecs = getSeedAttendanceRecords(todayIso);
    setEmployees(seedEmps);
    setRecords(seedRecs);
    setSelectedDate(todayIso);
    handleResetFilters();
  };

  const handleExportCsv = () => {
    const csv = generateCsvContent(visibleRecords.length > 0 ? visibleRecords : records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `absensi-hadirku-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const created: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [...prev, created]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#absensi"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('absensi');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            HadirKu
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav
            aria-label="Navigasi Utama"
            className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto"
          >
            <a
              href="#absensi"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('absensi');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'absensi'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Absensi Harian
            </a>
            <a
              href="#karyawan"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('karyawan');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'karyawan'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Data Karyawan
            </a>
            <a
              href="#rekap"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('rekap');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'rekap'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Rekapitulasi
            </a>
            <a
              href="#panduan"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('panduan');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'panduan'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              Ketentuan Jam Kerja
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Page Header & Date Control */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              <span>Sistem Informasi Kehadiran Terpadu</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>Jam Masuk Reguler 08:30 WIB</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {activeSection === 'absensi' && 'Lembar Absensi & Kehadiran Harian'}
              {activeSection === 'karyawan' && 'Direktori & Manajemen Karyawan'}
              {activeSection === 'rekap' && 'Laporan Rekapitulasi Kehadiran'}
              {activeSection === 'panduan' && 'Ketentuan & Standar Jam Kehadiran'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 h-10">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <label htmlFor="tanggal-absensi" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Tanggal:
              </label>
              <input
                id="tanggal-absensi"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-mono tabular-nums text-slate-900 bg-transparent focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleResetDemoData}
              className="h-10 px-3.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Data Contoh</span>
            </button>
          </div>
        </div>

        {/* KPI Strip — Single-Elevation, Tabular Numerals */}
        <section
          aria-label="Ringkasan Statistik Kehadiran"
          className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200"
        >
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Total Tercatat Hari Ini</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                data-testid="stat-total-records"
                className="text-2xl font-bold font-mono tabular-nums text-slate-900"
              >
                {summary.totalRecords}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                dari {employees.length} personel
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Hadir Tepat Waktu</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                data-testid="stat-tepat-waktu"
                className="text-2xl font-bold font-mono tabular-nums text-emerald-700"
              >
                {summary.tepatWaktuCount}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {summary.onTimeRate}% ketepatan
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Hadir Terlambat (&gt;08:30)</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                data-testid="stat-terlambat"
                className="text-2xl font-bold font-mono tabular-nums text-amber-700"
              >
                {summary.terlambatCount}
              </span>
              <span className="text-xs text-slate-500">
                Total hadir: <span className="font-mono tabular-nums">{summary.hadirCount}</span>
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Izin · Sakit · Cuti · Alpa</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                data-testid="stat-tidak-hadir"
                className="text-2xl font-bold font-mono tabular-nums text-slate-900"
              >
                {summary.izinCount + summary.sakitCount + summary.cutiCount + summary.alpaCount}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {summary.izinCount} Izin · {summary.sakitCount} Sakit
              </span>
            </div>
          </div>
        </section>

        {/* Active View Content */}
        {activeSection === 'absensi' && (
          <div className="space-y-8">
            <QuickAttendanceForm
              employees={employees}
              selectedDate={selectedDate}
              onAddAttendance={handleAddAttendance}
            />

            <AttendanceTable
              records={visibleRecords}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              departments={departments}
              onCheckOut={handleCheckOut}
              onDeleteRecord={handleDeleteRecord}
              onResetFilters={handleResetFilters}
              onExportCsv={handleExportCsv}
            />
          </div>
        )}

        {activeSection === 'karyawan' && (
          <EmployeeDirectory
            employees={employees}
            records={records}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeSection === 'rekap' && (
          <RecapReport
            employees={employees}
            records={records}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeSection === 'panduan' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Prosedur Pencatatan Kehadiran Karyawan
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Panduan operasional pencatatan waktu kerja harian, toleransi keterlambatan, dan pelaporan izin atau sakit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  01. Jam Kerja Operasional
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Jam masuk standar dimulai pukul <span className="font-mono tabular-nums font-medium text-slate-900">08:30</span> dan jam pulang reguler pukul <span className="font-mono tabular-nums font-medium text-slate-900">17:00</span>. Pencatatan kehadiran melewati pukul 08:30 otomatis ditandai sebagai terlambat beserta perhitungan selisih menit.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  02. Mode Kerja Fleksibel
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Setiap personel wajib mencantumkan lokasi kerja aktual saat melakukan check-in: bekerja di kantor (<span className="font-medium text-slate-800">WFO</span>), bekerja dari rumah (<span className="font-medium text-slate-800">WFH</span>), atau penugasan dinas luar (<span className="font-medium text-slate-800">Lapangan</span>).
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  03. Pelaporan Izin & Sakit
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Karyawan yang berhalangan hadir wajib memilih status <span className="font-medium text-slate-800">Izin</span>, <span className="font-medium text-slate-800">Sakit</span>, atau <span className="font-medium text-slate-800">Cuti</span> serta menyertakan keterangan singkat pada kolom catatan harian untuk keperluan rekapitulasi SDM.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>HadirKu — Sistem Pencatatan Kehadiran & Rekapitulasi Karyawan</div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('absensi')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Lembar Absensi
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveSection('rekap')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Laporan Bulanan
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportCsv}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Unduh CSV
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
