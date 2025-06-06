SELECT DISTINCT tk.*
FROM TAI_KHOAN tk
JOIN NHAN_VIEN nv ON nv.ma_tk = tk.ma_tk
JOIN LICH_SU_LAM_VIEC ls ON ls.ma_nv = nv.ma_nv
WHERE ls.thoi_gian_ket_thuc IS NULL