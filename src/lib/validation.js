
export function normalizePhone(phone) {
  return String(phone || "").replace(/[\s.-]/g, "");
}

export function validateLead(data) {
  const errors = {};

  const fullName = String(data.fullName || "").trim();
  const phone = normalizePhone(data.phone);

  if (fullName.length < 2 || fullName.length > 100) {
    errors.fullName = "Họ tên phải từ 2 đến 100 ký tự.";
  }

  if (!/^0[35789]\d{8}$/.test(phone)) {
    errors.phone = "Số điện thoại Việt Nam không hợp lệ.";
  }

  if (!data.province) {
    errors.province = "Vui lòng chọn tỉnh/thành phố.";
  }

  if (!data.packageId) {
    errors.packageId = "Vui lòng chọn gói cước.";
  }

  if (!data.consent) {
    errors.consent = "Bạn cần đồng ý với chính sách xử lý dữ liệu.";
  }

  return errors;
}
