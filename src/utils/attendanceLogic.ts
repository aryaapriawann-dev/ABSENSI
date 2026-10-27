export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpa';

export type WorkMode = 'WFO' | 'WFH' | 'Lapangan';

export interface Employee {
  id: string;
  nip: string;
  name: string;
  department: string;
  role: string;
  shiftStart: string; // e.g. "08:30"
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  nip: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  status: AttendanceStatus;
  workMode: WorkMode;
  isLate: boolean;
  lateMinutes: number;
  notes: string;
}

export interface AttendanceSummary {
  totalRecords: number;
  hadirCount: number;
  tepatWaktuCount: number;
  terlambatCount: number;
  izinCount: number;
  sakitCount: number;
  cutiCount: number;
  alpaCount: number;
  attendanceRate: number; // percentage 0 - 100
  onTimeRate: number; // percentage 0 - 100 among Hadir
}

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', nip: '102401', name: 'Budi Santoso', department: 'Operasional', role: 'Koordinator Lapangan', shiftStart: '08:30' },
  { id: 'emp-2', nip: '102402', name: 'Siti Aminah', department: 'Keuangan', role: 'Analis Anggaran', shiftStart: '08:30' },
  { id: 'emp-3', nip: '102403', name: 'Reza Rahadian', department: 'Teknologi', role: 'Insinyur Perangkat Lunak', shiftStart: '08:30' },
  { id: 'emp-4', nip: '102404', name: 'Nadia Putri', department: 'SDM & Umum', role: 'Spesialis Personalia', shiftStart: '08:30' },
  { id: 'emp-5', nip: '102405', name: 'Dimas Pratama', department: 'Pemasaran', role: 'Manajer Kampanye', shiftStart: '08:30' },
  { id: 'emp-6', nip: '102406', name: 'Lestari Wulandari', department: 'Teknologi', role: 'Desainer Produk', shiftStart: '08:30' },
  { id: 'emp-7', nip: '102407', name: 'Hendra Wijaya', department: 'Operasional', role: 'Staf Logistik', shiftStart: '08:30' },
  { id: 'emp-8', nip: '102408', name: 'Kartika Sari', department: 'Keuangan', role: 'Staf Akuntansi', shiftStart: '08:30' },
];

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSeedAttendanceRecords(todayDate: string): AttendanceRecord[] {
  return [
    {
      id: 'att-101',
      employeeId: 'emp-1',
      nip: '102401',
      employeeName: 'Budi Santoso',
      department: 'Operasional',
      date: todayDate,
      checkIn: '08:12',
      checkOut: '17:05',
      status: 'Hadir',
      workMode: 'WFO',
      isLate: false,
      lateMinutes: 0,
      notes: 'Pengecekan gudang pagi selesai',
    },
    {
      id: 'att-102',
      employeeId: 'emp-2',
      nip: '102402',
      employeeName: 'Siti Aminah',
      department: 'Keuangan',
      date: todayDate,
      checkIn: '08:24',
      checkOut: '17:15',
      status: 'Hadir',
      workMode: 'WFO',
      isLate: false,
      lateMinutes: 0,
      notes: 'Rekonsiliasi kas harian',
    },
    {
      id: 'att-103',
      employeeId: 'emp-3',
      nip: '102403',
      employeeName: 'Reza Rahadian',
      department: 'Teknologi',
      date: todayDate,
      checkIn: '08:48',
      checkOut: null,
      status: 'Hadir',
      workMode: 'WFH',
      isLate: true,
      lateMinutes: 18,
      notes: 'Kendala lalu lintas pagi',
    },
    {
      id: 'att-104',
      employeeId: 'emp-4',
      nip: '102404',
      employeeName: 'Nadia Putri',
      department: 'SDM & Umum',
      date: todayDate,
      checkIn: '08:05',
      checkOut: null,
      status: 'Hadir',
      workMode: 'WFO',
      isLate: false,
      lateMinutes: 0,
      notes: 'Sesi orientasi karyawan baru',
    },
    {
      id: 'att-105',
      employeeId: 'emp-5',
      nip: '102405',
      employeeName: 'Dimas Pratama',
      department: 'Pemasaran',
      date: todayDate,
      checkIn: null,
      checkOut: null,
      status: 'Izin',
      workMode: 'WFO',
      isLate: false,
      lateMinutes: 0,
      notes: 'Mengurus dokumen administrasi keluarga',
    },
    {
      id: 'att-106',
      employeeId: 'emp-6',
      nip: '102406',
      employeeName: 'Lestari Wulandari',
      department: 'Teknologi',
      date: todayDate,
      checkIn: '08:19',
      checkOut: '17:02',
      status: 'Hadir',
      workMode: 'WFH',
      isLate: false,
      lateMinutes: 0,
      notes: 'Review desain antarmuka sprint 4',
    },
    {
      id: 'att-107',
      employeeId: 'emp-7',
      nip: '102407',
      employeeName: 'Hendra Wijaya',
      department: 'Operasional',
      date: todayDate,
      checkIn: null,
      checkOut: null,
      status: 'Sakit',
      workMode: 'WFO',
      isLate: false,
      lateMinutes: 0,
      notes: 'Surat keterangan dokter terlampir',
    },
  ];
}

/**
 * Parses "HH:mm" string into total minutes since midnight.
 * Returns null if invalid.
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

/**
 * Evaluates lateness based on checkIn time vs shiftStart (default "08:30").
 */
export function evaluateLateness(
  checkIn: string | null,
  status: AttendanceStatus,
  shiftStart = '08:30'
): { isLate: boolean; lateMinutes: number } {
  if (status !== 'Hadir' || !checkIn) {
    return { isLate: false, lateMinutes: 0 };
  }
  const inMin = parseTimeToMinutes(checkIn);
  const shiftMin = parseTimeToMinutes(shiftStart);
  if (inMin === null || shiftMin === null) {
    return { isLate: false, lateMinutes: 0 };
  }
  if (inMin > shiftMin) {
    return { isLate: true, lateMinutes: inMin - shiftMin };
  }
  return { isLate: false, lateMinutes: 0 };
}

/**
 * Calculates formatted work duration between checkIn and checkOut (e.g. "8j 53m").
 */
export function calculateWorkDuration(checkIn: string | null, checkOut: string | null): string {
  const inMin = parseTimeToMinutes(checkIn);
  const outMin = parseTimeToMinutes(checkOut);
  if (inMin === null || outMin === null) return '—';
  if (outMin < inMin) return '—';
  const diff = outMin - inMin;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}j ${String(minutes).padStart(2, '0')}m`;
}

/**
 * Calculates summary statistics for a list of attendance records.
 */
export function calculateAttendanceSummary(records: AttendanceRecord[]): AttendanceSummary {
  const totalRecords = records.length;
  let hadirCount = 0;
  let tepatWaktuCount = 0;
  let terlambatCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let cutiCount = 0;
  let alpaCount = 0;

  for (const r of records) {
    if (r.status === 'Hadir') {
      hadirCount++;
      if (r.isLate) {
        terlambatCount++;
      } else {
        tepatWaktuCount++;
      }
    } else if (r.status === 'Izin') {
      izinCount++;
    } else if (r.status === 'Sakit') {
      sakitCount++;
    } else if (r.status === 'Cuti') {
      cutiCount++;
    } else if (r.status === 'Alpa') {
      alpaCount++;
    }
  }

  const attendanceRate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 0;
  const onTimeRate = hadirCount > 0 ? Math.round((tepatWaktuCount / hadirCount) * 100) : 0;

  return {
    totalRecords,
    hadirCount,
    tepatWaktuCount,
    terlambatCount,
    izinCount,
    sakitCount,
    cutiCount,
    alpaCount,
    attendanceRate,
    onTimeRate,
  };
}

export interface FilterCriteria {
  searchQuery: string;
  statusFilter: 'Semua' | AttendanceStatus | 'Terlambat';
  departmentFilter: string;
  dateFilter?: string;
}

export function filterAttendanceRecords(
  records: AttendanceRecord[],
  criteria: FilterCriteria
): AttendanceRecord[] {
  const q = criteria.searchQuery.trim().toLowerCase();
  return records.filter((r) => {
    if (criteria.dateFilter && r.date !== criteria.dateFilter) {
      return false;
    }
    if (criteria.departmentFilter && criteria.departmentFilter !== 'Semua') {
      if (r.department !== criteria.departmentFilter) return false;
    }
    if (criteria.statusFilter !== 'Semua') {
      if (criteria.statusFilter === 'Terlambat') {
        if (!(r.status === 'Hadir' && r.isLate)) return false;
      } else if (r.status !== criteria.statusFilter) {
        return false;
      }
    }
    if (q) {
      const matchName = r.employeeName.toLowerCase().includes(q);
      const matchNip = r.nip.toLowerCase().includes(q);
      const matchDept = r.department.toLowerCase().includes(q);
      const matchNotes = r.notes.toLowerCase().includes(q);
      if (!matchName && !matchNip && !matchDept && !matchNotes) return false;
    }
    return true;
  });
}

export interface NewAttendanceInput {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  workMode: WorkMode;
  checkIn: string;
  checkOut: string;
  notes: string;
}

export function validateAttendanceInput(
  input: NewAttendanceInput,
  employees: Employee[]
): { valid: boolean; error?: string } {
  if (!input.employeeId) {
    return { valid: false, error: 'Pilih karyawan terlebih dahulu.' };
  }
  const emp = employees.find((e) => e.id === input.employeeId);
  if (!emp) {
    return { valid: false, error: 'Data karyawan tidak ditemukan.' };
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'Tanggal kehadiran tidak valid.' };
  }
  if (input.status === 'Hadir') {
    const inMin = parseTimeToMinutes(input.checkIn);
    if (inMin === null) {
      return { valid: false, error: 'Jam masuk wajib diisi dengan format HH:mm (contoh 08:15).' };
    }
    if (input.checkOut.trim() !== '') {
      const outMin = parseTimeToMinutes(input.checkOut);
      if (outMin === null) {
        return { valid: false, error: 'Format jam pulang tidak valid (gunakan HH:mm).' };
      }
      if (outMin < inMin) {
        return { valid: false, error: 'Jam pulang tidak boleh lebih awal dari jam masuk.' };
      }
    }
  }
  return { valid: true };
}

export function generateCsvContent(records: AttendanceRecord[]): string {
  const headers = [
    'Tanggal',
    'NIP',
    'Nama Karyawan',
    'Divisi',
    'Status',
    'Keterangan Waktu',
    'Mode Kerja',
    'Jam Masuk',
    'Jam Pulang',
    'Durasi Kerja',
    'Catatan',
  ];
  const rows = records.map((r) => {
    const timeStatus =
      r.status === 'Hadir'
        ? r.isLate
          ? `Terlambat (${r.lateMinutes}m)`
          : 'Tepat Waktu'
        : r.status;
    const duration = calculateWorkDuration(r.checkIn, r.checkOut);
    const cols = [
      r.date,
      r.nip,
      `"${r.employeeName.replace(/"/g, '""')}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      r.status,
      timeStatus,
      r.workMode,
      r.checkIn ?? '-',
      r.checkOut ?? '-',
      duration,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
    return cols.join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}
