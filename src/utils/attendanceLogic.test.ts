import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeToMinutes,
  evaluateLateness,
  calculateWorkDuration,
  calculateAttendanceSummary,
  filterAttendanceRecords,
  validateAttendanceInput,
  generateCsvContent,
  INITIAL_EMPLOYEES,
  getSeedAttendanceRecords,
} from './attendanceLogic';

test('parseTimeToMinutes parses valid 24h times and rejects invalid ones', () => {
  assert.equal(parseTimeToMinutes('08:30'), 510);
  assert.equal(parseTimeToMinutes('00:00'), 0);
  assert.equal(parseTimeToMinutes('17:45'), 1065);
  assert.equal(parseTimeToMinutes('25:00'), null);
  assert.equal(parseTimeToMinutes('8:30'), null);
  assert.equal(parseTimeToMinutes(null), null);
});

test('evaluateLateness flags arrivals after 08:30 as late for Hadir status only', () => {
  assert.deepEqual(evaluateLateness('08:15', 'Hadir', '08:30'), {
    isLate: false,
    lateMinutes: 0,
  });
  assert.deepEqual(evaluateLateness('08:30', 'Hadir', '08:30'), {
    isLate: false,
    lateMinutes: 0,
  });
  assert.deepEqual(evaluateLateness('08:48', 'Hadir', '08:30'), {
    isLate: true,
    lateMinutes: 18,
  });
  assert.deepEqual(evaluateLateness('09:10', 'Izin', '08:30'), {
    isLate: false,
    lateMinutes: 0,
  });
});

test('calculateWorkDuration computes accurate hours and minutes', () => {
  assert.equal(calculateWorkDuration('08:12', '17:05'), '8j 53m');
  assert.equal(calculateWorkDuration('08:00', '08:45'), '45m');
  assert.equal(calculateWorkDuration('08:30', null), '—');
  assert.equal(calculateWorkDuration('17:00', '08:00'), '—');
});

test('calculateAttendanceSummary aggregates counts and percentages accurately', () => {
  const records = getSeedAttendanceRecords('2026-10-27');
  const summary = calculateAttendanceSummary(records);
  assert.equal(summary.totalRecords, 7);
  assert.equal(summary.hadirCount, 5);
  assert.equal(summary.tepatWaktuCount, 4);
  assert.equal(summary.terlambatCount, 1);
  assert.equal(summary.izinCount, 1);
  assert.equal(summary.sakitCount, 1);
  assert.equal(summary.attendanceRate, 71);
  assert.equal(summary.onTimeRate, 80);
});

test('filterAttendanceRecords filters by status, lateness, department, and search query', () => {
  const records = getSeedAttendanceRecords('2026-10-27');

  const lateOnly = filterAttendanceRecords(records, {
    searchQuery: '',
    statusFilter: 'Terlambat',
    departmentFilter: 'Semua',
  });
  assert.equal(lateOnly.length, 1);
  assert.equal(lateOnly[0].employeeName, 'Reza Rahadian');

  const techSearch = filterAttendanceRecords(records, {
    searchQuery: 'lestari',
    statusFilter: 'Semua',
    departmentFilter: 'Teknologi',
  });
  assert.equal(techSearch.length, 1);
  assert.equal(techSearch[0].nip, '102406');
});

test('validateAttendanceInput enforces required employee, valid time, and checkOut >= checkIn', () => {
  const validRes = validateAttendanceInput(
    {
      employeeId: 'emp-1',
      date: '2026-10-27',
      status: 'Hadir',
      workMode: 'WFO',
      checkIn: '08:20',
      checkOut: '17:00',
      notes: '',
    },
    INITIAL_EMPLOYEES
  );
  assert.equal(validRes.valid, true);

  const invalidOut = validateAttendanceInput(
    {
      employeeId: 'emp-1',
      date: '2026-10-27',
      status: 'Hadir',
      workMode: 'WFO',
      checkIn: '09:00',
      checkOut: '08:00',
      notes: '',
    },
    INITIAL_EMPLOYEES
  );
  assert.equal(invalidOut.valid, false);
});

test('generateCsvContent outputs header and formatted rows', () => {
  const records = getSeedAttendanceRecords('2026-10-27').slice(0, 2);
  const csv = generateCsvContent(records);
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].includes('Nama Karyawan'));
  assert.ok(lines[1].includes('Budi Santoso'));
});
