
CREATE OR ALTER PROC sp_kiem_tra_cn_ton_tai
  @chi_nhanh INT
AS
BEGIN
  IF @chi_nhanh IS NOT NULL AND NOT EXISTS (SELECT * FROM CHI_NHANH WHERE ma_cn = @chi_nhanh)
	BEGIN
		;THROW 50001, N'Không tìm thấy chi nhánh', 1
	END
END;
GO

CREATE OR ALTER PROC sp_kiem_tra_kv_ton_tai
  @khu_vuc NVARCHAR(50)
AS
BEGIN
  IF @khu_vuc IS NOT NULL AND NOT EXISTS (SELECT * FROM KHU_VUC WHERE ten_kv = @khu_vuc)
	BEGIN
		;THROW 50001, N'Không tìm thấy khu vực', 1;
	END
END;
GO

CREATE OR ALTER PROC sp_kiem_tra_thoi_gian 
  @tu_ngay DATE,
  @den_ngay DATE
AS
BEGIN
	IF @tu_ngay > @den_ngay
	BEGIN
		;THROW 50002, N'Ngày bắt đầu phải < ngày kết thúc', 1;
	END
END
GO

-- MAIN
CREATE OR ALTER PROC usp_xem_mon_ban_nhieu_nhat
	@top INT,
	@chi_nhanh INT,
  @khu_vuc NVARCHAR(50),
	@tu_ngay DATE,
	@den_ngay DATE
AS
BEGIN
  EXEC sp_kiem_tra_kv_ton_tai @khu_vuc
  EXEC sp_kiem_tra_cn_ton_tai @chi_nhanh
  
  IF @khu_vuc IS NOT NULL AND @chi_nhanh IS NOT NULL
  BEGIN
    ;THROW 50001, N'Không thể chọn cả chi nhánh và khu vực', 1;
  END

  EXEC sp_kiem_tra_thoi_gian @tu_ngay, @den_ngay
  SELECT TOP (@top) 
		ctpd.ma_mon as MaMon, 
		ma.ten_mon as TenMon, 
		SUM(ctpd.so_luong) as TongSoLuong,
		SUM(ctpd.so_luong * CAST(ctpd.don_gia AS FLOAT)) as TongTienBan
	FROM CHI_TIET_PHIEU_DAT ctpd
	JOIN PHIEU_DAT pd ON pd.ma_phieu = ctpd.ma_phieu
	JOIN MON_AN ma ON ctpd.ma_mon = ma.ma_mon
	JOIN HOA_DON hd ON hd.ma_phieu = pd.ma_phieu
  JOIN CHI_NHANH cn ON cn.ma_cn = pd.ma_chi_nhanh
	WHERE (@chi_nhanh IS NULL OR pd.ma_chi_nhanh = @chi_nhanh)
  AND (@khu_vuc IS NULL OR cn.ten_kv = @khu_vuc)
	AND hd.ngay_xuat BETWEEN @tu_ngay AND @den_ngay
	GROUP BY ctpd.ma_mon, ma.ten_mon
	ORDER BY TongTienBan DESC
END
GO


-- -- 0.5
-- CREATE NONCLUSTERED INDEX idx_pd_macn 
-- ON PHIEU_DAT (ma_chi_nhanh)

-- GO

-- -- 0.5
-- CREATE NONCLUSTERED INDEX idx_hd_ma_phieu 
-- ON HOA_DON (ma_phieu)
-- INCLUDE (ngay_xuat)

-- GO

/*

DROP INDEX idx_pd_macn ON PHIEU_DAT
DROP INDEX idx_hd_ma_phieu ON HOA_DON

exec sp_mon_ban_nhieu_nhat_theo_chi_nhanh 10, 1, '2020-1-1', '2025-1-1'
exec sp_mon_ban_nhieu_nhat_theo_khu_vuc 3, 'KV70', '2020-1-1', '2025-1-1'

*/

CREATE OR ALTER PROC sp_kiem_tra_mon_an_ton_tai
  @mon_an INT
AS
BEGIN
  IF @mon_an IS NOT NULL AND NOT EXISTS (SELECT * FROM MON_AN WHERE ma_mon = @mon_an)
  BEGIN
    ;THROW 50001, N'Không tìm thấy món ăn', 1;
  END
END
GO

-- MAIN
--Xem doanh thu món ăn theo chi nhánh
CREATE OR ALTER PROC usp_xem_doanh_thu_mon_an
	@top INT,
  @mon_an INT,
	@chi_nhanh INT,
  @khu_vuc NVARCHAR(50),
	@tu_ngay DATE,
	@den_ngay DATE
AS
BEGIN
  EXEC sp_kiem_tra_mon_an_ton_tai @mon_an
  
  EXEC sp_kiem_tra_kv_ton_tai @khu_vuc
  EXEC sp_kiem_tra_cn_ton_tai @chi_nhanh
  
  IF @khu_vuc IS NOT NULL AND @chi_nhanh IS NOT NULL
  BEGIN
    ;THROW 50001, N'Không thể chọn cả chi nhánh và khu vực', 1;
  END

  EXEC sp_kiem_tra_thoi_gian @tu_ngay, @den_ngay

	SELECT TOP (@top)
		ma.ma_mon as MaMon,
		ma.ten_mon as TenMon,
		SUM(ctpd.so_luong * CAST(ctpd.don_gia AS FLOAT)) as TongDoanhThu
	FROM MON_AN ma
	LEFT JOIN CHI_TIET_PHIEU_DAT ctpd ON ctpd.ma_mon = ma.ma_mon
	LEFT JOIN PHIEU_DAT pd ON pd.ma_phieu = ctpd.ma_phieu
	LEFT JOIN HOA_DON hd ON hd.ma_phieu = pd.ma_phieu
  LEFT JOIN CHI_NHANH cn ON cn.ma_cn = pd.ma_chi_nhanh
	WHERE (@mon_an IS NULL OR ma.ma_mon = @mon_an)
  AND (@chi_nhanh IS NULL OR pd.ma_chi_nhanh = @chi_nhanh)
  AND (@khu_vuc IS NULL OR cn.ten_kv = @khu_vuc)
	AND hd.ngay_xuat BETWEEN @tu_ngay AND @den_ngay
	GROUP BY ma.ma_mon, ma.ten_mon
	ORDER BY TongDoanhThu DESC

END
GO

/*
exec sp_xem_doanh_thu_mon_an_theo_chi_nhanh 1000, 4, '2020-1-1', '2025-1-1'
*/

-- MAIN
--Xem số lượt khách ahng
CREATE OR ALTER PROC usp_xem_so_luot_khach_hang
  @chi_nhanh INT,
  @khu_vuc NVARCHAR(50),
	@tu_ngay DATE,
	@den_ngay DATE
AS
BEGIN
  EXEC sp_kiem_tra_kv_ton_tai @khu_vuc
  EXEC sp_kiem_tra_cn_ton_tai @chi_nhanh
  
  IF @khu_vuc IS NOT NULL AND @chi_nhanh IS NOT NULL
  BEGIN
    ;THROW 50001, N'Không thể chọn cả chi nhánh và khu vực', 1;
  END

	EXEC sp_kiem_tra_thoi_gian @tu_ngay, @den_ngay

	SELECT 
    cn.ten_kv AS KhuVuc,
		cn.ma_cn AS MaChiNhanh,
    cn.ten_cn AS TenChiNhanh,
		COUNT(hd.ma_phieu) as TongLuotKhach
	FROM CHI_NHANH cn
	LEFT JOIN PHIEU_DAT pd ON pd.ma_chi_nhanh = cn.ma_cn
	LEFT JOIN HOA_DON hd ON hd.ma_phieu = pd.ma_phieu
	WHERE (@chi_nhanh IS NULL OR cn.ma_cn = @chi_nhanh)
  AND (@khu_vuc IS NULL OR cn.ten_kv = @khu_vuc)
  AND hd.ngay_xuat BETWEEN @tu_ngay AND @den_ngay
	GROUP BY cn.ten_kv, cn.ma_cn, cn.ten_cn

END
GO
-- CREATE NONCLUSTERED INDEX idx_hoa_don_ngay_xuat 
-- ON HOA_DON (ngay_xuat) 
-- INCLUDE (ma_phieu)
-- GO

/*
CHECKPOINT; 
GO 
DBCC DROPCLEANBUFFERS; 
GO
DROP INDEX idx_hoa_don_ngay_xuat ON HOA_DON
exec sp_xem_so_luot_khach_hang '2020-1-1', '2024-1-1'
*/

-- MAIN
------------------------------10. Báo cáo doanh thu theo khu vực--------------------------------------
CREATE OR ALTER PROCEDURE usp_BaoCaoDoanhThuKhuVuc
  @ten_kv NVARCHAR(50) = NULL,
  @ngay_bat_dau DATETIME = NULL,
  @ngay_ket_thuc DATETIME = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET ARITHABORT ON;
  SET XACT_ABORT ON;
  
  BEGIN TRY
    -- Set default date range to current month if not provided
    SET @ngay_bat_dau = ISNULL(@ngay_bat_dau, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0));
    SET @ngay_ket_thuc = ISNULL(@ngay_ket_thuc, DATEADD(MONTH, DATEDIFF(MONTH, -1, GETDATE()), -1));

    -- Validate date range
    IF @ngay_bat_dau > @ngay_ket_thuc
      THROW 50001, N'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!', 1;

    -- Validate region if provided
    IF @ten_kv IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM KHU_VUC WITH (NOLOCK) WHERE ten_kv = @ten_kv
    )
      THROW 50002, N'Khu vực không tồn tại!', 1;

    -- Main query with overflow protection
    SELECT 
      kv.ten_kv AS KhuVuc,
      COUNT(DISTINCT hd.ma_phieu) AS SoDon,
      ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS TongDoanhThu,
      ROUND(CAST(ISNULL(SUM(CAST(hd.so_tien_duoc_giam AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS TongGiamGia,
      ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS DoanhThuThuc,
      ROUND(CAST(CASE 
        WHEN COUNT(DISTINCT hd.ma_phieu) = 0 THEN 0 
        ELSE CAST(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))) AS DECIMAL(18,2)) / COUNT(DISTINCT hd.ma_phieu)
      END AS DECIMAL(18,2)), 2) AS TrungBinhTrenDon
    FROM KHU_VUC kv 
    LEFT JOIN CHI_NHANH cn  ON kv.ten_kv = cn.ten_kv
    LEFT JOIN PHIEU_DAT pd  ON cn.ma_cn = pd.ma_chi_nhanh
    LEFT JOIN HOA_DON hd ON pd.ma_phieu = hd.ma_phieu
    WHERE (@ten_kv IS NULL OR kv.ten_kv = @ten_kv)
    AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc
    GROUP BY kv.ten_kv
  END TRY
  BEGIN CATCH
    ;THROW
  END CATCH
END
GO

-- MAIN
------------------------------11. Báo cáo doanh thu theo chi nhánh--------------------------------------
CREATE OR ALTER PROCEDURE usp_BaoCaoDoanhThuChiNhanh
  @ma_chi_nhanh INT = NULL,
  @ngay_bat_dau DATETIME = NULL,
  @ngay_ket_thuc DATETIME = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET ARITHABORT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    -- Set default dates if NULL
    SET @ngay_bat_dau = ISNULL(@ngay_bat_dau, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0));
    SET @ngay_ket_thuc = ISNULL(@ngay_ket_thuc, DATEADD(MONTH, DATEDIFF(MONTH, -1, GETDATE()), -1));

    -- Validate date range
    IF @ngay_bat_dau > @ngay_ket_thuc
      THROW 50001, N'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!', 1;

    -- Validate branch ID if provided
    IF @ma_chi_nhanh IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM CHI_NHANH WITH (NOLOCK) WHERE ma_cn = @ma_chi_nhanh
    )
      THROW 50002, N'Mã chi nhánh không tồn tại!', 1;

    SELECT 
      cn.ma_cn AS MaChiNhanh,
      cn.ten_cn AS TenChiNhanh,
      kv.ten_kv AS KhuVuc,
      COUNT(DISTINCT hd.ma_phieu) AS SoDon,
      ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS TongDoanhThu,
      ROUND(CAST(ISNULL(SUM(CAST(hd.so_tien_duoc_giam AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS TongGiamGia,
      ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS DoanhThuThuc,
      ROUND(CAST(CASE 
        WHEN COUNT(DISTINCT hd.ma_phieu) = 0 THEN 0 
        ELSE CAST(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))) AS DECIMAL(18,2)) / COUNT(DISTINCT hd.ma_phieu)
      END AS DECIMAL(18,2)), 2) AS TrungBinhTrenDon
    FROM CHI_NHANH cn  
    LEFT JOIN KHU_VUC kv ON cn.ten_kv = kv.ten_kv
    LEFT JOIN PHIEU_DAT pd ON cn.ma_cn = pd.ma_chi_nhanh
    LEFT JOIN HOA_DON hd ON pd.ma_phieu = hd.ma_phieu AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc
    WHERE @ma_chi_nhanh IS NULL OR cn.ma_cn = @ma_chi_nhanh
    GROUP BY cn.ma_cn, cn.ten_cn, kv.ten_kv
  END TRY
  BEGIN CATCH
      THROW;
  END CATCH;
END;
GO

-- MAIN
------------------------------12. Xem điểm đánh giá(dịch vụ, món ăn,..)--------------------------------------
CREATE OR ALTER PROCEDURE usp_XemDanhGia
  @ma_chi_nhanh INT = NULL,
  @khu_vuc NVARCHAR(50) = NULL,
  @ngay_bat_dau DATETIME = NULL,
  @ngay_ket_thuc DATETIME = NULL
AS
BEGIN
  SET NOCOUNT ON;

  EXEC sp_kiem_tra_kv_ton_tai @khu_vuc
  EXEC sp_kiem_tra_cn_ton_tai @ma_chi_nhanh

  IF @ma_chi_nhanh IS NOT NULL AND @khu_vuc IS NOT NULL
  BEGIN
    ;THROW 50001, N'Không thể chọn cả chi nhánh và khu vực', 1;
  END

  -- Thiết lập ngày mặc định là tháng hiện tại nếu không được cung cấp
  IF @ngay_bat_dau IS NULL 
    SET @ngay_bat_dau = DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0);
  IF @ngay_ket_thuc IS NULL 
    SET @ngay_ket_thuc = DATEADD(MONTH, DATEDIFF(MONTH, -1, GETDATE()), -1);

  -- Kiểm tra dữ liệu tồn tại trước khi thực hiện truy vấn
  IF NOT EXISTS (
    SELECT 1
    FROM DANH_GIA dg
    JOIN HOA_DON hd ON dg.ma_phieu = hd.ma_phieu
    WHERE (@ma_chi_nhanh IS NULL OR EXISTS (
      SELECT 1 FROM PHIEU_DAT pd 
      WHERE pd.ma_phieu = hd.ma_phieu AND pd.ma_chi_nhanh = @ma_chi_nhanh)
    )
    AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc
  )
  BEGIN
      PRINT N'Không có dữ liệu đánh giá trong khoảng thời gian này.';
      RETURN;
  END

  -- Truy vấn dữ liệu
  SELECT 
      ISNULL(cn.ten_cn, N'Không có dữ liệu') AS TenChiNhanh,
      ISNULL(COUNT(dg.ma_phieu), 0) AS SoLuotDanhGia,
      ROUND(AVG(CAST(ISNULL(dg.diem_vi_tri, 0) AS FLOAT)), 2) AS DiemViTri,
      ROUND(AVG(CAST(ISNULL(dg.diem_phuc_vu, 0) AS FLOAT)), 2) AS DiemPhucVu,
      ROUND(AVG(CAST(ISNULL(dg.diem_mon_an, 0) AS FLOAT)), 2) AS DiemMonAn,
      ROUND(AVG(CAST(ISNULL(dg.diem_gia_ca, 0) AS FLOAT)), 2) AS DiemGiaCa,
      ROUND(AVG(CAST(ISNULL(dg.diem_khong_gian, 0) AS FLOAT)), 2) AS DiemKhongGian,
      ROUND(AVG(CAST(ISNULL(dg.diem_vi_tri, 0) 
                    + ISNULL(dg.diem_phuc_vu, 0) 
                    + ISNULL(dg.diem_mon_an, 0) 
                    + ISNULL(dg.diem_gia_ca, 0) 
                    + ISNULL(dg.diem_khong_gian, 0) AS FLOAT)) / 5, 2) AS DiemTrungBinh
  FROM DANH_GIA dg
  JOIN HOA_DON hd ON dg.ma_phieu = hd.ma_phieu
  JOIN PHIEU_DAT pd ON hd.ma_phieu = pd.ma_phieu
  JOIN CHI_NHANH cn ON pd.ma_chi_nhanh = cn.ma_cn
  WHERE (@ma_chi_nhanh IS NULL OR cn.ma_cn = @ma_chi_nhanh)
  AND (@khu_vuc IS NULL OR cn.ten_kv = @khu_vuc)
  AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc
  GROUP BY cn.ten_cn
END
GO