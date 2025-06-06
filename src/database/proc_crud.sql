
--0.Khu vực
--Thêm khu vực
CREATE OR ALTER PROCEDURE sp_them_khu_vuc
    @ten_kv NVARCHAR(30)
AS
BEGIN
    -- Kiểm tra trùng lặp tên khu vực
    IF EXISTS (SELECT 1 FROM KHU_VUC WHERE ten_kv = @ten_kv)
    BEGIN
        PRINT N'Tên khu vực đã tồn tại!';
        RETURN;
    END
    -- Thêm khu vực mới
    INSERT INTO KHU_VUC (ten_kv)
    VALUES (@ten_kv);

    PRINT N'Thêm khu vực thành công!';
END;
GO
--1.TAI_KHOAN
--Tạo tài khoản
CREATE OR ALTER PROC sp_tao_tai_khoan
  @ten_dang_nhap NVARCHAR(50),
  @mat_khau NVARCHAR(255),
  @vai_tro NVARCHAR(10),
  @ho_ten NVARCHAR(50),
  @sdt CHAR(10),
  @dia_chi NVARCHAR(50)
AS
  BEGIN TRANSACTION;

  BEGIN TRY
  INSERT INTO tai_khoan
    (ten_tai_khoan, mat_khau, vai_tro)
  VALUES
    (@ten_dang_nhap, @mat_khau, @vai_tro);

  DECLARE @ma_tk INT = SCOPE_IDENTITY();
  INSERT INTO tt_khach_hang(ma_tk, ho_ten, sdt, dia_chi)
  VALUES
    (@ma_tk, @ho_ten, @sdt, @dia_chi);
  END TRY
  BEGIN CATCH
    ROLLBACK;
    RAISERROR('Loi khi tao tai khoan', 16, 1);
  END CATCH
GO
--Tìm kiếm tài khoản theo tên đăng nhập
CREATE OR ALTER PROC sp_lay_tai_khoan_kh_theo_ten_dang_nhap
  @ten_dang_nhap NVARCHAR(50)
AS
  SELECT *
  FROM tai_khoan JOIN tt_khach_hang ON tai_khoan.ma_tk = tt_khach_hang.ma_tk
  WHERE ten_tai_khoan = @ten_dang_nhap;
GO

CREATE OR ALTER PROC sp_cap_nhat_tt_khach_hang
  @ma_tk INT,
  @ho_ten NVARCHAR(50),
  @sdt CHAR(10),
  @dia_chi NVARCHAR(50)
AS
  IF NOT EXISTS(SELECT *
  FROM tt_khach_hang
  WHERE ma_tk = @ma_tk)
  BEGIN
    RAISERROR('Tai khoan khong ton tai', 16, 1);
    RETURN;
  END

  UPDATE tt_khach_hang
  SET ho_ten = @ho_ten, sdt = @sdt, dia_chi = @dia_chi
  WHERE ma_tk = @ma_tk;
GO
--Xóa tài khoản
CREATE OR ALTER PROC sp_xoa_tai_khoan
  @ma_tk INT
AS
  IF NOT EXISTS(SELECT *
  FROM tt_khach_hang
  WHERE ma_tk = @ma_tk)
  BEGIN
    RAISERROR('Tai khoan khong ton tai', 16, 1);
    RETURN;
  END

  BEGIN TRANSACTION;
  BEGIN TRY
    DELETE FROM tt_khach_hang WHERE ma_tk = @ma_tk;
    DELETE FROM tai_khoan WHERE ma_tk = @ma_tk;
  END TRY
  BEGIN CATCH
    ROLLBACK;
    RAISERROR('Loi khi xoa tai khoan', 16, 1);
  END CATCH
GO
--2.BO_PHAN
-- Thêm BO_PHAN
CREATE OR ALTER PROCEDURE sp_them_bo_phan
    @ten_bp NVARCHAR(50),
    @luong INT
AS
BEGIN
    -- Kiểm tra lương lớn hơn 0
    IF (@luong <= 0)
    BEGIN
        PRINT 'Lương phải lớn hơn 0!';
        RETURN;
    END;

    -- Kiểm tra tên bộ phận đã tồn tại
    IF EXISTS (SELECT 1 FROM BO_PHAN WHERE ten_bp = @ten_bp)
    BEGIN
        PRINT 'Tên bộ phận đã tồn tại!';
        RETURN;
    END;

    -- Kiểm tra điều kiện lương của bộ phận quản lý
    IF (@ten_bp = 'Quản lý' AND @luong <= (SELECT MAX(luong) FROM BO_PHAN WHERE ten_bp <> 'Quản lý'))
    BEGIN
        PRINT 'Lương của bộ phận quản lý phải lớn hơn lương của nhân viên!';
        RETURN;
    END;

    -- Thêm bộ phận
    INSERT INTO BO_PHAN (ten_bp, luong)
    VALUES (@ten_bp, @luong);

    PRINT 'Thêm bộ phận thành công!';
END;
GO
-- Xóa BO_PHAN
CREATE OR ALTER PROCEDURE sp_xoa_bo_phan
    @ma_bp INT
AS
BEGIN
    BEGIN TRY
        -- Bắt đầu giao dịch
        BEGIN TRANSACTION;

        -- Kiểm tra mã bộ phận tồn tại
        IF NOT EXISTS (SELECT 1 FROM BO_PHAN WHERE ma_bp = @ma_bp)
        BEGIN
            PRINT 'Mã bộ phận không tồn tại!';
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Xóa liên kết trong bảng NHAN_VIEN
        UPDATE NHAN_VIEN
        SET ma_bo_phan = NULL
        WHERE ma_bo_phan = @ma_bp;

        -- Xóa bộ phận
        DELETE FROM BO_PHAN WHERE ma_bp = @ma_bp;

        -- Commit giao dịch
        COMMIT TRANSACTION;

        PRINT 'Xóa bộ phận thành công!';
    END TRY
    BEGIN CATCH
        -- Rollback giao dịch nếu có lỗi
        ROLLBACK TRANSACTION;
        PRINT 'Lỗi xảy ra khi xóa bộ phận!';
        THROW;
    END CATCH
END;
GO

-- Sửa BO_PHAN
CREATE OR ALTER PROCEDURE sp_sua_bo_phan
    @ma_bp INT,
    @ten_bp NVARCHAR(50),
    @luong INT
AS
BEGIN
    -- Kiểm tra mã bộ phận tồn tại
    IF NOT EXISTS (SELECT 1 FROM BO_PHAN WHERE ma_bp = @ma_bp)
    BEGIN
        PRINT 'Mã bộ phận không tồn tại!';
        RETURN;
    END;

    -- Kiểm tra lương lớn hơn 0
    IF (@luong <= 0)
    BEGIN
        PRINT 'Lương phải lớn hơn 0!';
        RETURN;
    END;

    -- Kiểm tra tên bộ phận trùng lặp (trừ bộ phận hiện tại)
    IF EXISTS (SELECT 1 FROM BO_PHAN WHERE ten_bp = @ten_bp AND ma_bp != @ma_bp)
    BEGIN
        PRINT 'Tên bộ phận đã tồn tại!';
        RETURN;
    END;

    -- Kiểm tra điều kiện lương của bộ phận quản lý
    IF (@ten_bp = 'Quản lý' AND @luong <= (SELECT MAX(luong) FROM BO_PHAN WHERE ten_bp <> 'Quản lý'))
    BEGIN
        PRINT 'Lương của bộ phận quản lý phải lớn hơn lương của nhân viên!';
        RETURN;
    END;

    -- Sửa thông tin bộ phận
    UPDATE BO_PHAN
    SET ten_bp = @ten_bp,
        luong = @luong
    WHERE ma_bp = @ma_bp;

    PRINT 'Sửa thông tin bộ phận thành công!';
END;
GO
--03.Nhân viên
--Thêm NHAN_VIEN
CREATE OR ALTER PROCEDURE usp_them_nhan_vien
    @ten_tk VARCHAR(50),
    @mat_khau NVARCHAR(255),
    @ma_cn INT,
    @ho_ten NVARCHAR(50),
    @gioi_tinh NVARCHAR(5),
    @sdt CHAR(10),
    @dia_chi NVARCHAR(50),
    @ngay_sinh DATETIME,
    @ma_bo_phan INT
AS
BEGIN
    -- -- Kiểm tra giới tính
    -- IF (@gioi_tinh NOT IN ('Nam', 'Nữ', 'Khác'))
    -- BEGIN
    --     PRINT 'Giới tính không hợp lệ!';
    --     RETURN;
    -- END;

    -- Kiểm tra ngày sinh
    IF (@ngay_sinh > GETDATE())
    BEGIN
        PRINT 'Ngày sinh không được lớn hơn ngày hiện tại!';
        RETURN;
    END;
    
    -- -- Kiểm tra mã tài khoản tồn tại
    -- IF NOT EXISTS (SELECT 1 FROM TAI_KHOAN WHERE ten_tai_khoan = @ten_tk)
    -- BEGIN
    --     PRINT 'Mã tài khoản không tồn tại!';
    --     RETURN;
    -- END;
    -- Kiểm tra mã bộ phận tồn tại
    IF NOT EXISTS (SELECT 1 FROM BO_PHAN WHERE ma_bp = @ma_bo_phan)
    BEGIN
        PRINT 'Mã bộ phận không tồn tại!';
        RETURN;
    END;

    -- Thêm nhân viên nếu tất cả điều kiện hợp lệ
    BEGIN
        INSERT INTO TAI_KHOAN
            (ten_tai_khoan, mat_khau, vai_tro)
        VALUES
            (@ten_tk, @mat_khau, 'nv');

        INSERT INTO NHAN_VIEN 
            (ma_tk, ho_ten, gioi_tinh, sdt, dia_chi, ngay_sinh, ma_bo_phan)
        VALUES 
            (SCOPE_IDENTITY(), @ho_ten, @gioi_tinh, @sdt, @dia_chi, @ngay_sinh, @ma_bo_phan);

        INSERT INTO LICH_SU_LAM_VIEC (ma_nv, ma_chi_nhanh, thoi_gian_bat_dau)
        VALUES (SCOPE_IDENTITY(), @ma_cn, GETDATE());
    END;
END;
GO

-- XÓA NHAN_VIEN
CREATE OR ALTER PROCEDURE sp_xoa_nhan_vien
    @ma_nv INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE ma_nv = @ma_nv)
        BEGIN
            PRINT 'Nhân viên không tồn tại!';
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        DECLARE @ma_tk INT;
        SELECT @ma_tk = ma_tk FROM NHAN_VIEN WHERE ma_nv = @ma_nv;

        DELETE FROM LICH_SU_LAM_VIEC WHERE ma_nv = @ma_nv;

        DELETE FROM NHAN_VIEN WHERE ma_nv = @ma_nv;

        DELETE FROM TAI_KHOAN WHERE ma_tk = @ma_tk;

        COMMIT TRANSACTION;
        PRINT 'Xóa nhân viên và tài khoản thành công!';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT 'Lỗi xảy ra khi xóa nhân viên!';
        THROW;
    END CATCH
END;
GO

-- Sửa NHAN_VIEN
CREATE OR ALTER PROCEDURE sp_sua_nhan_vien
    @ma_nv INT,
    @ma_tk INT,
    @ho_ten NVARCHAR(50),
    @gioi_tinh NVARCHAR(5),
    @sdt CHAR(10),
    @dia_chi NVARCHAR(50),
    @ngay_sinh DATETIME,
    @ma_bo_phan INT
AS
BEGIN
    -- Kiểm tra nhân viên tồn tại
    IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE ma_nv = @ma_nv)
    BEGIN
        PRINT 'Nhân viên không tồn tại!';
        RETURN;
    END;

    -- Kiểm tra giới tính
    IF (@gioi_tinh NOT IN ('Nam', 'Nữ', 'Khác'))
    BEGIN
        PRINT 'Giới tính không hợp lệ!';
        RETURN;
    END;

    -- Kiểm tra ngày sinh
    IF (@ngay_sinh > GETDATE())
    BEGIN
        PRINT 'Ngày sinh không được lớn hơn ngày hiện tại!';
        RETURN;
    END;

    -- Kiểm tra mã tài khoản tồn tại
    IF NOT EXISTS (SELECT 1 FROM TAI_KHOAN WHERE ma_tk = @ma_tk)
    BEGIN
        PRINT 'Mã tài khoản không tồn tại!';
        RETURN;
    END;

    -- Kiểm tra mã bộ phận tồn tại
    IF NOT EXISTS (SELECT 1 FROM BO_PHAN WHERE ma_bp = @ma_bo_phan)
    BEGIN
        PRINT 'Mã bộ phận không tồn tại!';
        RETURN;
    END;

    -- Sửa thông tin nhân viên
    UPDATE NHAN_VIEN
    SET ho_ten = @ho_ten,
        ma_tk=@ma_tk,
        gioi_tinh = @gioi_tinh,
        sdt = @sdt,
        dia_chi = @dia_chi,
        ngay_sinh = @ngay_sinh,
        ma_bo_phan = @ma_bo_phan
    WHERE ma_nv = @ma_nv;
    PRINT 'Sửa thông tin nhân viên thành công!';
END;
GO

--4.CHI_NHANH
--Thêm chi nhánh
CREATE OR ALTER PROCEDURE sp_them_chi_nhanh
    @ma_cn INT,
    @ten_cn NVARCHAR(50),
    @dia_chi NVARCHAR(50),
    @hotline VARCHAR(10),
    @ma_nv_ql INT,
    @gio_mo_cua TIME(7),
    @gio_dong_cua TIME(7),
    @bai_do_xe_may CHAR(1),
    @bai_do_xe_oto CHAR(1),
    @ten_kv NVARCHAR(30),
    @giao_hang CHAR(1)
AS
BEGIN
    -- Kiểm tra trùng lặp mã chi nhánh
    IF EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn = @ma_cn)
    BEGIN
        PRINT N'Mã chi nhánh đã tồn tại!';
        RETURN;
    END

	-- Kiểm tra khu vực có tồn tại hay không
	IF NOT EXISTS (SELECT 1 FROM KHU_VUC WHERE ten_kv = @ten_kv)
	BEGIN
		PRINT N'Khu vực không tồn tại! Thêm khu vực trước.';
		RETURN;
	END

    -- Kiểm tra trùng lặp địa chỉ
    IF EXISTS (SELECT 1 FROM CHI_NHANH WHERE dia_chi = @dia_chi)
    BEGIN
        PRINT N'Địa chỉ chi nhánh đã tồn tại!';
        RETURN;
    END

    -- Thêm chi nhánh mới
    INSERT INTO CHI_NHANH (ma_cn, ten_cn, dia_chi, hotline, ma_nv_ql, gio_mo_cua, gio_dong_cua, bai_do_xe_may, bai_do_xe_oto, ten_kv, giao_hang)
    VALUES (@ma_cn, @ten_cn, @dia_chi, @hotline, @ma_nv_ql, @gio_mo_cua, @gio_dong_cua, @bai_do_xe_may, @bai_do_xe_oto, @ten_kv, @giao_hang);

    PRINT N'Thêm chi nhánh thành công!';
END;
GO

--Update chi nhánh
CREATE OR ALTER PROCEDURE sp_sua_chi_nhanh
    @ma_cn INT,
    @ten_cn NVARCHAR(50),
    @dia_chi NVARCHAR(50),
    @hotline VARCHAR(10),
    @ma_nv_ql INT,
    @gio_mo_cua TIME(7),
    @gio_dong_cua TIME(7),
    @bai_do_xe_may CHAR(1),
    @bai_do_xe_oto CHAR(1),
    @giao_hang CHAR(1)
AS
BEGIN
    -- Kiểm tra nếu mã chi nhánh không tồn tại
    IF NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn = @ma_cn)
    BEGIN
        PRINT N'Mã chi nhánh không tồn tại!';
        RETURN;
    END

    -- Kiểm tra trùng lặp địa chỉ (không phải chính chi nhánh đang cập nhật)
    IF EXISTS (SELECT 1 
               FROM CHI_NHANH 
               WHERE dia_chi = @dia_chi AND ma_cn <> @ma_cn)
    BEGIN
        PRINT N'Địa chỉ chi nhánh đã tồn tại ở chi nhánh khác!';
        RETURN;
    END

    -- Cập nhật thông tin chi nhánh
    UPDATE CHI_NHANH
    SET 
        ten_cn = @ten_cn,
        dia_chi = @dia_chi,
        hotline = @hotline,
        ma_nv_ql = @ma_nv_ql,
        gio_mo_cua = @gio_mo_cua,
        gio_dong_cua = @gio_dong_cua,
        bai_do_xe_may = @bai_do_xe_may,
        bai_do_xe_oto = @bai_do_xe_oto,
        giao_hang = @giao_hang
    WHERE ma_cn = @ma_cn;

    PRINT N'Cập nhật chi nhánh thành công!';
END;
GO
--5.LOAI_MON_AN
--Thêm loại món ăn
CREATE OR ALTER PROC sp_them_loai_mon_an
    @ten_loai NVARCHAR(50)
AS
BEGIN
    INSERT INTO LOAI_MON_AN VALUES(@ten_loai);
END
GO
--Xóa loại món ăn
CREATE OR ALTER PROC sp_xoa_loai_mon_an
    @ma_loai INT
AS
BEGIN
    IF NOT EXISTS (SELECT* FROM LOAI_MON_AN WHERE ma_loai=@ma_loai)
    BEGIN
        RAISERROR('Loại món ăn không tồn tại',16,1);
        RETURN;
    END
    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM MON_AN WHERE loai=@ma_loai;
        DELETE FROM LOAI_MON_AN WHERE ma_loai=@ma_loai;
        COMMIT;
    END TRY
    BEGIN CATCH
        RAISERROR('Lỗi',16,1);
        ROLLBACK;
    END CATCH
END
GO
--6.MON_AN
--Thêm món ăn
CREATE OR ALTER PROC sp_them_mon_an
    @ten_mon NVARCHAR(50),
    @gia INT,
    @loai INT,
    @gia_hien_tai INT,
    @giao_hang CHAR(1)
AS
BEGIN
    IF NOT EXISTS(SELECT * FROM LOAI_MON_AN WHERE ma_loai=@loai)
    BEGIN 
        RAISERROR('Loại món ăn không tồn tại',16,1);
        RETURN;
    END
    INSERT INTO MON_AN VALUES(@ten_mon,@gia,@loai,@gia_hien_tai,@giao_hang);
END
GO
--Xóa món ăn
CREATE OR ALTER PROC sp_xoa_mon_an
    @ma_mon INT
AS
BEGIN
    IF NOT EXISTS(SELECT* FROM MON_AN WHERE ma_mon=@ma_mon)
    BEGIN
        RAISERROR('Món ăn không tồn tại',16,1);
        RETURN;
    END
    DELETE FROM MON_AN WHERE ma_mon=@ma_mon;
END
GO
--7.CT_THUC_DON
--Thêm CT_THUC_DON
CREATE OR ALTER PROCEDURE sp_them_ct_thuc_don
    @ma_mon INT,
    @ten_kv NVARCHAR(30)
AS
BEGIN
    -- Kiểm tra nếu `ma_mon` không tồn tại trong bảng `MON_AN`
    IF NOT EXISTS (SELECT 1 FROM MON_AN WHERE ma_mon = @ma_mon)
    BEGIN
        PRINT N'Mã món không tồn tại trong bảng món ăn!';
        RETURN;
    END

    -- Kiểm tra nếu `ten_kv` không tồn tại trong bảng `KHU_VUC`
    IF NOT EXISTS (SELECT 1 FROM KHU_VUC WHERE ten_kv = @ten_kv)
    BEGIN
        PRINT N'Tên khu vực không tồn tại!';
        RETURN;
    END

    -- Kiểm tra trùng lặp
    IF EXISTS (SELECT 1 FROM CT_THUC_DON WHERE ma_mon = @ma_mon AND ten_kv = @ten_kv)
    BEGIN
        PRINT N'Chi tiết thực đơn đã tồn tại!';
        RETURN;
    END

    -- Thêm chi tiết thực đơn
    INSERT INTO CT_THUC_DON (ma_mon, ten_kv)
    VALUES (@ma_mon, @ten_kv);

    PRINT N'Thêm chi tiết thực đơn thành công!';
END;
GO
--Xóa CT_THUC_DON
CREATE OR ALTER PROCEDURE sp_xoa_ct_thuc_don
    @ma_mon INT,
    @ten_kv NVARCHAR(30)
AS
BEGIN
    -- Kiểm tra nếu chi tiết thực đơn tồn tại
    IF NOT EXISTS (SELECT 1 FROM CT_THUC_DON WHERE ma_mon = @ma_mon AND ten_kv = @ten_kv)
    BEGIN
        PRINT N'Chi tiết thực đơn không tồn tại!';
        RETURN;
    END

    -- Xóa chi tiết thực đơn
    DELETE FROM CT_THUC_DON WHERE ma_mon = @ma_mon AND ten_kv = @ten_kv;

    PRINT N'Chi tiết thực đơn đã được xóa thành công!';
END;
GO

--8.MON_KHONG_PV
--THêm MON_KHONG_PV
CREATE OR ALTER PROCEDURE sp_them_mon_khong_pv
    @ma_mon INT,
    @ma_cn INT
AS
BEGIN
    -- Kiểm tra nếu `ma_mon` không tồn tại trong bảng `MON_AN`
    IF NOT EXISTS (SELECT 1 FROM MON_AN WHERE ma_mon = @ma_mon)
    BEGIN
        PRINT N'Mã món không tồn tại trong bảng món ăn!';
        RETURN;
    END

    -- Kiểm tra nếu `ma_cn` không tồn tại trong bảng `CHI_NHANH`
    IF NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn = @ma_cn)
    BEGIN
        PRINT N'Mã chi nhánh không tồn tại!';
        RETURN;
    END

    -- Kiểm tra trùng lặp
    IF EXISTS (SELECT 1 FROM MON_KHONG_PV WHERE ma_mon = @ma_mon AND ma_cn = @ma_cn)
    BEGIN
        PRINT N'Món ăn không phục vụ tại chi nhánh này đã tồn tại!';
        RETURN;
    END

    -- Thêm món ăn không phục vụ
    INSERT INTO MON_KHONG_PV (ma_mon, ma_cn)
    VALUES (@ma_mon, @ma_cn);

    PRINT N'Thêm món ăn không phục vụ thành công!';
END;
GO
--Xóa MON_KHONG_PV
CREATE OR ALTER PROCEDURE sp_xoa_mon_khong_pv
    @ma_mon INT,
    @ma_cn INT
AS
BEGIN
    -- Kiểm tra nếu món ăn không phục vụ tại chi nhánh tồn tại
    IF NOT EXISTS (SELECT 1 FROM MON_KHONG_PV WHERE ma_mon = @ma_mon AND ma_cn = @ma_cn)
    BEGIN
        PRINT N'Món ăn không phục vụ tại chi nhánh này không tồn tại!';
        RETURN;
    END

    -- Xóa món ăn không phục vụ
    DELETE FROM MON_KHONG_PV WHERE ma_mon = @ma_mon AND ma_cn = @ma_cn;

    PRINT N'Món ăn không phục vụ đã được xóa thành công!';
END;
GO
--09.LICH_SU_LAM_VIEC
-- Thêm LICH_SU_LAM_VIEC
CREATE OR ALTER PROCEDURE usp_them_lich_su_lam_viec
    @ma_nv INT,
    @ma_chi_nhanh INT,
    @thoi_gian_bat_dau DATETIME,
    @thoi_gian_ket_thuc DATETIME
AS
BEGIN
    -- Kiểm tra nhân viên và chi nhánh tồn tại
    IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE ma_nv = @ma_nv)
    BEGIN
        ;THROW 50001, N'Nhân viên không tồn tại!', 1;
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn = @ma_chi_nhanh)
    BEGIN
		;THROW 50001, N'Chi nhánh không tồn tại', 1;
   END;

    -- Kiểm tra ngày sinh phải nhỏ hơn ngày vào làm
    IF EXISTS (
        SELECT 1
        FROM NHAN_VIEN
        WHERE ma_nv = @ma_nv AND ngay_sinh >= @thoi_gian_bat_dau
    )

    -- Kiểm tra thời gian kết thúc lớn hơn thời gian bắt đầu
    IF (@thoi_gian_ket_thuc <= @thoi_gian_bat_dau)
    BEGIN
        ;THROW 50002, N'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!', 1;
    END;

    -- Kiểm tra xem nhân viên có làm việc tại chi nhánh khác trong cùng thời gian không
    IF EXISTS (
        SELECT 1
        FROM LICH_SU_LAM_VIEC
        WHERE ma_nv = @ma_nv
        AND ma_chi_nhanh <> @ma_chi_nhanh
        AND (NOT (
			thoi_gian_bat_dau > ISNULL(@thoi_gian_ket_thuc, GETDATE())
			OR ISNULL(thoi_gian_ket_thuc, GETDATE()) < @thoi_gian_bat_dau
		))
    )
    BEGIN
        ;THROW 50004, 'Nhân viên không thể làm việc tại hai chi nhánh trong cùng một thời gian!', 1;
    END;

	UPDATE LICH_SU_LAM_VIEC
	SET thoi_gian_ket_thuc = GETDATE()
	WHERE ma_nv = @ma_nv
	AND thoi_gian_ket_thuc IS NULL 
	
    -- Thêm bản ghi lịch sử làm việc
    INSERT INTO LICH_SU_LAM_VIEC (ma_nv, ma_chi_nhanh, thoi_gian_bat_dau, thoi_gian_ket_thuc)
    VALUES (@ma_nv, @ma_chi_nhanh, @thoi_gian_bat_dau, @thoi_gian_ket_thuc);
END;
GO
-- -- Xóa LICH_SU_LAM_VIEC
CREATE OR ALTER PROCEDURE sp_xoa_lich_su_lam_viec
    @ma_nv INT,
    @ma_chi_nhanh INT,
    @thoi_gian_bat_dau DATETIME
AS
BEGIN
    -- Kiểm tra bản ghi tồn tại
    IF NOT EXISTS (SELECT 1 
                   FROM LICH_SU_LAM_VIEC 
                   WHERE ma_nv = @ma_nv AND ma_chi_nhanh = @ma_chi_nhanh AND thoi_gian_bat_dau = @thoi_gian_bat_dau)
    BEGIN
        PRINT 'Lịch sử làm việc không tồn tại!';
        RETURN;
    END;

    -- Xóa bản ghi lịch sử làm việc
    DELETE FROM LICH_SU_LAM_VIEC
    WHERE ma_nv = @ma_nv AND ma_chi_nhanh = @ma_chi_nhanh AND thoi_gian_bat_dau = @thoi_gian_bat_dau;

    PRINT 'Xóa lịch sử làm việc thành công!';
END;
GO
-- Sửa LICH_SU_LAM_VIEC
CREATE OR ALTER PROCEDURE sp_sua_lich_su_lam_viec
    @ma_nv INT,
    @ma_chi_nhanh INT,
    @thoi_gian_bat_dau DATETIME,
    @thoi_gian_ket_thuc DATETIME
AS
BEGIN
    -- Kiểm tra bản ghi tồn tại
    IF NOT EXISTS (SELECT 1 
                   FROM LICH_SU_LAM_VIEC 
                   WHERE ma_nv = @ma_nv AND ma_chi_nhanh = @ma_chi_nhanh AND thoi_gian_bat_dau = @thoi_gian_bat_dau)
    BEGIN
        PRINT 'Lịch sử làm việc không tồn tại!';
        RETURN;
    END;

    -- Kiểm tra ngày sinh phải nhỏ hơn ngày vào làm
    IF EXISTS (
        SELECT 1
        FROM NHAN_VIEN
        WHERE ma_nv = @ma_nv AND ngay_sinh >= @thoi_gian_bat_dau
    )
    BEGIN
        PRINT 'Lỗi: Ngày sinh của nhân viên phải nhỏ hơn ngày vào làm.';
        RETURN;
    END;

    -- Kiểm tra thời gian kết thúc lớn hơn thời gian bắt đầu
    IF (@thoi_gian_ket_thuc <= @thoi_gian_bat_dau)
    BEGIN
        PRINT 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!';
        RETURN;
    END;

    -- Kiểm tra xem nhân viên có làm việc tại chi nhánh khác trong cùng thời gian không
    IF EXISTS (
        SELECT 1
        FROM LICH_SU_LAM_VIEC
        WHERE ma_nv = @ma_nv
          AND ma_chi_nhanh <> @ma_chi_nhanh
          AND thoi_gian_bat_dau < ISNULL(@thoi_gian_ket_thuc, GETDATE())
          AND ISNULL(thoi_gian_ket_thuc, GETDATE()) > @thoi_gian_bat_dau
    )
    BEGIN
        PRINT 'Nhân viên không thể làm việc tại hai chi nhánh trong cùng một thời gian!';
        RETURN;
    END;

    -- Sửa thời gian kết thúc
    UPDATE LICH_SU_LAM_VIEC
    SET thoi_gian_ket_thuc = @thoi_gian_ket_thuc
    WHERE ma_nv = @ma_nv AND ma_chi_nhanh = @ma_chi_nhanh AND thoi_gian_bat_dau = @thoi_gian_bat_dau;

    PRINT 'Sửa lịch sử làm việc thành công!';
END;
GO
--10.THE
--Tạo THE
CREATE OR ALTER PROC sp_tao_the
    @nv_lap_the INT,
    @ho_ten NVARCHAR(50),
    @cccd CHAR(12),
    @sdt CHAR(10),
    @email NVARCHAR(50),
    @gioi_tinh NVARCHAR(5)
AS
BEGIN
     IF NOT EXISTS (SELECT 1 
                   FROM LICH_SU_LAM_VIEC 
                   WHERE ma_nv = @nv_lap_the
                   AND GETDATE() <= ISNULL(thoi_gian_ket_thuc,GETDATE()))
    BEGIN 
        RAISERROR('Nhân viên không tồn tại', 16, 1);
        RETURN;
    END
     INSERT INTO THE
    (nv_lap_the, ho_ten, cccd, sdt, email, gioi_tinh)
  VALUES
    (@nv_lap_the, @ho_ten, @cccd, @sdt, @email, @gioi_tinh);
     PRINT N'Thẻ đã được tạo thành công!'
END
GO
--Xóa THE
CREATE OR ALTER PROC sp_xoa_the
    @ma_the INT
AS
BEGIN
    IF NOT EXISTS(SELECT* FROM THE WHERE ma_the=@ma_the)
    BEGIN
        RAISERROR('Thẻ không tồn tại',16,1);
        RETURN;
    END
    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM HOA_DON WHERE ma_the=@ma_the;
        DELETE FROM THE WHERE ma_the=@ma_the;
    END TRY
    BEGIN CATCH
        RAISERROR('Lỗi',16,1);
        ROLLBACK;
    END CATCH

END
GO
--11.BAN_DAT
--Thêm bàn đặt
CREATE OR ALTER PROCEDURE sp_them_ban_dat
    @ma_chi_nhanh INT,
    @ma_ban INT
AS
BEGIN
    IF NOT EXISTS(SELECT * FROM CHI_NHANH WHERE ma_cn=@ma_chi_nhanh)
    BEGIN
        RAISERROR('Chi nhánh không tồn tại',16,1);
        RETURN;
    END
    INSERT INTO BAN_DAT (ma_chi_nhanh, ma_ban)
    VALUES (@ma_chi_nhanh, @ma_ban);
END
GO
--Xóa bàn đặt
CREATE OR ALTER PROCEDURE sp_xoa_ban_dat
    @ma_chi_nhanh INT,
    @ma_ban INT
AS
BEGIN
    IF NOT EXISTS(SELECT * FROM BAN_DAT WHERE ma_chi_nhanh=@ma_chi_nhanh AND ma_ban=@ma_ban)
    BEGIN
        RAISERROR('Bàn đặt không tồn tại',16,1);
        RETURN;
    END
    DELETE FROM BAN_DAT WHERE ma_chi_nhanh=@ma_chi_nhanh AND ma_ban=@ma_ban;
END
GO
--12.PHIEU_DAT
--Tạo PHIEU_DAT
CREATE OR ALTER PROCEDURE sp_tao_phieu_dat
    @ma_dh INT=NULL,
    @ma_chi_nhanh INT,
    @ma_ban INT,
    @nv_lap INT,
    @ngay_den DATETIME
AS
BEGIN
    DECLARE @ngay_lap DATETIME = GETDATE();
    IF NOT EXISTS (SELECT * FROM BAN_DAT WHERE ma_chi_nhanh = @ma_chi_nhanh AND ma_ban = @ma_ban)
    BEGIN
        RAISERROR('Bàn không tồn tại hoặc không có sẵn để đặt', 16, 1);
        RETURN;
    END
    IF NOT EXISTS (SELECT 1 
                   FROM LICH_SU_LAM_VIEC 
                   WHERE ma_nv = @nv_lap 
                   AND ma_chi_nhanh = @ma_chi_nhanh 
                   AND @ngay_lap <= ISNULL(thoi_gian_ket_thuc,GETDATE()))
    BEGIN 
        RAISERROR('Nhân viên không tồn tại hoặc không làm việc tại chi nhánh này', 16, 1);
        RETURN;
    END
    IF (@ngay_lap >= @ngay_den)
    BEGIN
        RAISERROR('Ngày lập phiếu không thể lớn hơn ngày đến', 16, 1);
        RETURN;
    END
    --Insert PHIEU_DAT
    INSERT INTO PHIEU_DAT (ma_chi_nhanh, ma_ban, nv_lap, ngay_lap, ngay_den)
    VALUES (@ma_chi_nhanh, @ma_ban, @nv_lap, @ngay_lap, @ngay_den);

    DECLARE @ma_phieu INT;
    SELECT @ma_phieu=MAX(ma_phieu) FROM PHIEU_DAT;
    --Kiểm tra nếu có mã đơn hàng thì update mã phiếu vào đơn hàng online
    IF @ma_dh IS NOT NULL
    BEGIN
        UPDATE DON_HANG_ONLINE
        SET ma_phieu=@ma_phieu
        WHERE ma_dh=@ma_dh
    END
END;
GO
--Xóa PHIEU_DAT
CREATE OR ALTER PROC sp_xoa_phieu_dat
    @ma_phieu INT
AS
BEGIN
    IF NOT EXISTS(SELECT* FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu)
    BEGIN
        RAISERROR('Phiếu đặt không tồn tại',16,1);
        RETURN;
    END
    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM CHI_TIET_PHIEU_DAT WHERE ma_phieu=@ma_phieu;
        DELETE FROM HOA_DON WHERE ma_phieu=@ma_phieu;
        DELETE FROM DANH_GIA WHERE ma_phieu=@ma_phieu;
        DELETE FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        RAISERROR('Lỗi',16,1);
        ROLLBACK;
    END CATCH
END
GO
--13.CHI_TIET_PHIEU_DAT
--Thêm CHI_TIET_PHIEU_DAT
CREATE OR ALTER PROCEDURE sp_them_chi_tiet_phieu_dat
    @ma_phieu INT,
    @ma_mon INT,
    @so_luong INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu)
    BEGIN 
        RAISERROR('Phiếu đặt không tồn tại', 16, 1);
        RETURN;
    END
    DECLARE @ma_cn INT;
    SELECT @ma_cn=ma_chi_nhanh FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu
    
    IF @ma_mon NOT IN (SELECT ma_mon FROM CT_THUC_DON cttd
                       JOIN CHI_NHANH cn ON cttd.ten_kv=cn.ten_kv
                       WHERE ma_cn=@ma_cn
                       EXCEPT
                       SELECT ma_mon FROM MON_KHONG_PV
                       WHERE ma_cn=@ma_cn)
    BEGIN
        RAISERROR('Món ăn không phục vụ tại chi nhánh ', 16, 1);
        RETURN;
    END

    DECLARE @don_gia INT;   
    SELECT @don_gia=gia_hien_tai
    FROM MON_AN
    WHERE ma_mon=@ma_mon

    INSERT INTO CHI_TIET_PHIEU_DAT (ma_phieu, ma_mon, so_luong,don_gia)
    VALUES (@ma_phieu, @ma_mon, @so_luong,@don_gia);
END
GO
--Cập nhật chi tiết phiếu đặt
CREATE OR ALTER PROCEDURE sp_cap_nhat_chi_tiet_phieu_dat
    @ma_phieu INT,
    @ma_mon INT,
    @so_luong INT
AS
BEGIN

    IF NOT EXISTS (SELECT 1 FROM CHI_TIET_PHIEU_DAT WHERE ma_phieu = @ma_phieu AND ma_mon = @ma_mon)
    BEGIN
        RAISERROR('Chi tiết phiếu đặt không tồn tại', 16, 1);
        RETURN;
    END
    -- Cập nhật số lượng món trong chi tiết phiếu đặt
    UPDATE CHI_TIET_PHIEU_DAT
    SET so_luong = @so_luong
    WHERE ma_phieu = @ma_phieu AND ma_mon = @ma_mon;
    PRINT N'Cập nhật chi tiết phiếu đặt thành công!';
END;
GO
--Xóa chi tiết phiếu đặt
CREATE OR ALTER PROCEDURE sp_xoa_chi_tiet_phieu_dat
    @ma_phieu INT,
    @ma_mon INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CHI_TIET_PHIEU_DAT WHERE ma_phieu = @ma_phieu AND ma_mon = @ma_mon)
    BEGIN
        RAISERROR('Chi tiết phiếu đặt không tồn tại', 16, 1);
        RETURN;
    END

    DECLARE @count INT;
    SELECT @count=count(*) FROM CHI_TIET_PHIEU_DAT WHERE ma_phieu=@ma_phieu;
    IF(@count=1)
    BEGIN
        RAISERROR('Mỗi phiếu đặt phải có ít nhất 1 món ăn', 16, 1);
        RETURN;
    END
    DELETE FROM CHI_TIET_PHIEU_DAT WHERE ma_phieu=@ma_phieu AND ma_mon=@ma_mon
END
GO
--14.HOA_DON
--Xóa HOA_DON
CREATE OR ALTER PROC sp_xoa_hoa_don
    @ma_phieu INT
AS   
BEGIN
    IF NOT EXISTS(SELECT* FROM HOA_DON WHERE ma_phieu=@ma_phieu)
    BEGIN
        RAISERROR('Hóa đơn không tồn tại',16,1);
        RETURN;
    END
    DELETE FROM HOA_DON WHERE ma_phieu=@ma_phieu;
END
GO
--15.DANH_GIA
-- proc them danh gia
create or alter procedure sp_them_danh_gia
    @ma_phieu int,
    @diem_vi_tri int,
    @diem_phuc_vu int,
    @diem_mon_an int,
    @diem_gia_ca int,
    @diem_khong_gian int,
    @binh_luan nvarchar(500)
as
begin
    if not exists (select 1 from hoa_don where ma_phieu= @ma_phieu)
    begin
        raiserror('hóa đơn không tồn tại', 16, 1);
        return;
    end
    if exists (select 1 from danh_gia where ma_phieu = @ma_phieu)
    begin
        raiserror('hóa đơn đã được đánh giá', 16, 1);
        return;
    end
    if @diem_vi_tri < 1 or @diem_vi_tri > 10 or
       @diem_phuc_vu < 1 or @diem_phuc_vu > 10 or
       @diem_mon_an < 1 or @diem_mon_an > 10 or
       @diem_gia_ca < 1 or @diem_gia_ca > 10 or
       @diem_khong_gian < 1 or @diem_khong_gian > 10
    begin
        raiserror('điểm đánh giá phải từ 1 đến 10', 16, 1);
        return;
    end

    insert into danh_gia (ma_phieu,diem_vi_tri,diem_phuc_vu,diem_mon_an,diem_gia_ca,diem_khong_gian,binh_luan)
    values (@ma_phieu,@diem_vi_tri,@diem_phuc_vu,@diem_mon_an,@diem_gia_ca,@diem_khong_gian,@binh_luan);
	end;
go
--16.TT_KHACH_HANG
--Thêm TT_KHACH_HANG
CREATE OR ALTER PROC sp_them_tt_khach_hang
    @ma_tk INT,
    @ho_ten NVARCHAR(50),
    @sdt CHAR(10),
    @dia_chi NVARCHAR(50)
AS
BEGIN
    DECLARE @vai_tro NVARCHAR(5);
    IF NOT EXISTS (SELECT * FROM TAI_KHOAN WHERE ma_tk=@ma_tk)
    BEGIN
        RAISERROR('Tài khoản không tồn tại',16,1);
        RETURN;
    END

    SELECT @vai_tro=vai_tro FROM TAI_KHOAN WHERE ma_tk=@ma_tk;
    IF @vai_tro ='kh'
    BEGIN
        INSERT INTO TT_KHACH_HANG VALUES(@ma_tk,@ho_ten,@sdt,@dia_chi)
    END
END
GO
--17.Truy cập
--Tạo truy cập
CREATE OR ALTER PROC sp_tao_truy_cap
  @ma_tk INT,
  @thoi_diem DATETIME,
  @thoi_gian INT
AS
  IF NOT EXISTS(SELECT *
  FROM tai_khoan
  WHERE ma_tk = @ma_tk)
  BEGIN
    RAISERROR('Tai khoan khong ton tai', 16, 1);
    RETURN;
  END

  INSERT INTO truy_cap
    (tai_khoan, thoi_diem, thoi_gian)
  VALUES
    (@ma_tk, @thoi_diem, @thoi_gian);
GO
--Lấy truy cập theo mã tk
CREATE OR ALTER PROC sp_lay_truy_cap_theo_ma_tk
  @ma_tk INT
AS
  SELECT *
  FROM truy_cap
  WHERE tai_khoan = @ma_tk;
GO
