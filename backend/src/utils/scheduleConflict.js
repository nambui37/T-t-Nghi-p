/** Trùng lịch: hai khoảng [start,end] có giao nhau (theo ngày) */

const ACTIVE_APPOINTMENT_STATUSES = ["da_xac_nhan", "dang_thuc_hien"];

function dateRangesOverlap(startA, endA, startB, endB) {
  const aS = new Date(startA);
  const aE = new Date(endA);
  const bS = new Date(startB);
  const bE = new Date(endB);
  return aS <= bE && bS <= aE;
}

/**
 * Lịch hẹn khác mà nhân viên đã được gán và có ngày trùng khoảng đang xét.
 */
async function findOverlappingAppointmentForNhanVien(
  db,
  nhanVienPk,
  excludeLichHenId,
  rangeStart,
  rangeEnd,
) {
  const ph = ACTIVE_APPOINTMENT_STATUSES.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT lh.id, lh.ngay_bat_dau, lh.ngay_ket_thuc, lh.guest_name, gdv.name AS service_name
     FROM lich_hen_nhan_vien lhnv
     INNER JOIN lich_hen lh ON lh.id = lhnv.lich_hen_id
     INNER JOIN goi_dich_vu gdv ON lh.goi_id = gdv.id
     WHERE lhnv.nhan_vien_id = ?
       AND lh.id <> ?
       AND lh.status IN (${ph})`,
    [nhanVienPk, excludeLichHenId, ...ACTIVE_APPOINTMENT_STATUSES],
  );

  for (const row of rows) {
    if (
      dateRangesOverlap(
        rangeStart,
        rangeEnd,
        row.ngay_bat_dau,
        row.ngay_ket_thuc,
      )
    ) {
      return row;
    }
  }
  return null;
}

module.exports = {
  ACTIVE_APPOINTMENT_STATUSES,
  dateRangesOverlap,
  findOverlappingAppointmentForNhanVien,
};
