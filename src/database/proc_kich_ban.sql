------------------------------8. Quản lý đăng nhập vào trang web--------------------------------------
CREATE OR ALTER PROCEDURE sp_DangNhap
    @ten_tai_khoan VARCHAR(50), -- Changed from @ten_dang_nhap
    @mat_khau VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ma_tk INT
    
    -- Check if account exists and password matches
    SELECT @ma_tk = ma_tk 
    FROM TAI_KHOAN 
    WHERE ten_tai_khoan = @ten_tai_khoan -- Changed from ten_dang_nhap
    AND mat_khau = @mat_khau

    IF @ma_tk IS NULL
    BEGIN
        RAISERROR('Tên đăng nhập hoặc mật khẩu không đúng', 16, 1);
        RETURN
    END

    -- Record access time
    INSERT INTO TRUY_CAP(tai_khoan, thoi_diem, thoi_gian) -- Added thoi_gian
    VALUES(@ma_tk, GETDATE(), 0) -- Added 0 for thoi_gian
END
GO
-------------------------------9. cập nhật thời gian truy cập--------------------------------------
CREATE OR ALTER PROCEDURE sp_CapNhatThoiGianTruyCap
    @ma_tk INT,
    @thoi_gian INT
AS
BEGIN
    SET NOCOUNT ON;
    -- Check if account exists in TRUY_CAP
    IF NOT EXISTS (
        SELECT 1 
        FROM TRUY_CAP 
        WHERE tai_khoan = @ma_tk 
        AND CAST(thoi_diem AS DATE) = CAST(GETDATE() AS DATE)
    )
    BEGIN
        RAISERROR('Không tìm thấy phiên truy cập cho tài khoản này', 16, 1);
        RETURN -1;
    END

    -- Update access time for the latest session
    UPDATE TRUY_CAP
    SET thoi_gian = @thoi_gian
    WHERE tai_khoan = @ma_tk
    AND thoi_diem = (
        SELECT MAX(thoi_diem)
        FROM TRUY_CAP
        WHERE tai_khoan = @ma_tk
    );

    RETURN 0;
END
GO
------------------------------10. Báo cáo doanh thu theo khu vực--------------------------------------
CREATE OR ALTER PROCEDURE sp_BaoCaoDoanhThuKhuVuc
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
            kv.ten_kv AS N'Khu Vực',
            COUNT(DISTINCT hd.ma_phieu) AS N'Số Đơn',
            ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Tổng Doanh Thu',
            ROUND(CAST(ISNULL(SUM(CAST(hd.so_tien_duoc_giam AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Tổng Giảm Giá',
            ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Doanh Thu Thực',
            ROUND(CAST(CASE 
                WHEN COUNT(DISTINCT hd.ma_phieu) = 0 THEN 0 
                ELSE CAST(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))) AS DECIMAL(18,2)) / COUNT(DISTINCT hd.ma_phieu)
            END AS DECIMAL(18,2)), 2) AS N'Trung Bình/Đơn'
        FROM KHU_VUC kv 
        LEFT JOIN CHI_NHANH cn  ON kv.ten_kv = cn.ten_kv
        LEFT JOIN PHIEU_DAT pd  ON cn.ma_cn = pd.ma_chi_nhanh
        LEFT JOIN HOA_DON hd ON pd.ma_phieu = hd.ma_phieu
        WHERE 
            (@ten_kv IS NULL OR kv.ten_kv = @ten_kv)
            AND (hd.ma_phieu IS NULL OR hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc)
        GROUP BY kv.ten_kv
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO

------------------------------11. Báo cáo doanh thu theo chi nhánh--------------------------------------
CREATE OR ALTER PROCEDURE sp_BaoCaoDoanhThuChiNhanh
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
            cn.ma_cn AS N'Mã Chi Nhánh',
            cn.ten_cn AS N'Chi Nhánh',
            kv.ten_kv AS N'Khu Vực',
            COUNT(DISTINCT hd.ma_phieu) AS N'Số Đơn',
            ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Tổng Doanh Thu',
            ROUND(CAST(ISNULL(SUM(CAST(hd.so_tien_duoc_giam AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Tổng Giảm Giá',
            ROUND(CAST(ISNULL(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))), 0) AS DECIMAL(18,2)), 2) AS N'Doanh Thu Thực',
            ROUND(CAST(CASE 
                WHEN COUNT(DISTINCT hd.ma_phieu) = 0 THEN 0 
                ELSE CAST(SUM(CAST(hd.tong_tien_can_tra AS DECIMAL(18,2))) AS DECIMAL(18,2)) / COUNT(DISTINCT hd.ma_phieu)
            END AS DECIMAL(18,2)), 2) AS N'Trung Bình/Đơn'
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
------------------------------12. Xem điểm đánh giá(dịch vụ, món ăn,..)--------------------------------------
CREATE OR ALTER PROCEDURE sp_XemDanhGia
    @ma_chi_nhanh INT = NULL,
    @ngay_bat_dau DATETIME = NULL,
    @ngay_ket_thuc DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu chi nhánh không tồn tại
    IF @ma_chi_nhanh IS NOT NULL AND NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn = @ma_chi_nhanh)
    BEGIN
        RAISERROR(N'Không tìm thấy chi nhánh với mã %d', 16, 1, @ma_chi_nhanh);
        RETURN;
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
                  WHERE pd.ma_phieu = hd.ma_phieu AND pd.ma_chi_nhanh = @ma_chi_nhanh))
          AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc
    )
    BEGIN
        PRINT N'Không có dữ liệu đánh giá trong khoảng thời gian này.';
        RETURN;
    END

    -- Truy vấn dữ liệu
    SELECT 
        ISNULL(cn.ten_cn, N'Không có dữ liệu') AS 'Chi Nhánh',
        ISNULL(COUNT(dg.ma_phieu), 0) AS 'Số Lượt Đánh Giá',
        ROUND(AVG(CAST(ISNULL(dg.diem_vi_tri, 0) AS FLOAT)), 2) AS 'Điểm Vị Trí',
        ROUND(AVG(CAST(ISNULL(dg.diem_phuc_vu, 0) AS FLOAT)), 2) AS 'Điểm Phục Vụ',
        ROUND(AVG(CAST(ISNULL(dg.diem_mon_an, 0) AS FLOAT)), 2) AS 'Điểm Món Ăn',
        ROUND(AVG(CAST(ISNULL(dg.diem_gia_ca, 0) AS FLOAT)), 2) AS 'Điểm Giá Cả',
        ROUND(AVG(CAST(ISNULL(dg.diem_khong_gian, 0) AS FLOAT)), 2) AS 'Điểm Không Gian',
        ROUND(AVG(CAST(ISNULL(dg.diem_vi_tri, 0) 
                       + ISNULL(dg.diem_phuc_vu, 0) 
                       + ISNULL(dg.diem_mon_an, 0) 
                       + ISNULL(dg.diem_gia_ca, 0) 
                       + ISNULL(dg.diem_khong_gian, 0) AS FLOAT)) / 5, 2) AS 'Điểm Trung Bình'
    FROM DANH_GIA dg
    JOIN HOA_DON hd ON dg.ma_phieu = hd.ma_phieu
    JOIN PHIEU_DAT pd ON hd.ma_phieu = pd.ma_phieu
    JOIN CHI_NHANH cn ON pd.ma_chi_nhanh = cn.ma_cn
    WHERE (@ma_chi_nhanh IS NULL OR cn.ma_cn = @ma_chi_nhanh)
      AND hd.ngay_xuat BETWEEN @ngay_bat_dau AND @ngay_ket_thuc

END
GO
----Tạo kiểu dữ liệu mới
CREATE TYPE DS_MON_AN AS TABLE (
    ma_mon INT,
    so_luong INT
)
GO
--Tạo phiếu đặt và thêm danh sách món ăn
CREATE OR ALTER PROCEDURE sp_tao_phieu_va_them_mon
    @ma_dh INT,
    @ma_chi_nhanh INT,
    @ma_ban INT,
    @nv_lap INT,
    @ngay_den DATETIME,
    @ds_mon_an AS DS_MON_AN READONLY
AS
BEGIN
    DECLARE @ma_phieu INT;
    DECLARE @ma_mon INT;
    DECLARE @so_luong INT;
    BEGIN TRANSACTION;
    BEGIN TRY
        EXEC sp_tao_phieu_dat
            @ma_dh=@ma_dh,
            @ma_chi_nhanh=@ma_chi_nhanh,
            @ma_ban= @ma_ban,
            @nv_lap=@nv_lap,
            @ngay_den=@ngay_den
        --Lấy mã phiếu
        SELECT @ma_phieu=MAX(ma_phieu) FROM PHIEU_DAT;
        --Tạo cusor
        DECLARE cur CURSOR FOR
        SELECT ma_mon, so_luong
        FROM @ds_mon_an;
        OPEN cur;
        FETCH NEXT FROM cur INTO @ma_mon, @so_luong;
        --Duyệt qua từng món ăn
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC sp_them_chi_tiet_phieu_dat 
                @ma_phieu = @ma_phieu, 
                @ma_mon = @ma_mon, 
                @so_luong = @so_luong;
            FETCH NEXT FROM cur INTO @ma_mon, @so_luong;   
        END;
        CLOSE cur;
        DEALLOCATE cur;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        RAISERROR('Lỗi',16,1);
        ROLLBACK TRANSACTION;
    END CATCH
END
GO
-- DECLARE @tmp DS_MON_AN;
-- INSERT INTO @tmp VALUES (1, 10), (2, 29), (10, 10);
-- EXEC sp_tao_phieu_va_them_mon
--     @ma_dh=1,
--     @ma_ban=10,
--     @ma_chi_nhanh=10,
--     @nv_lap=24,
--     @ngay_den='2024-12-7',
--     @ds_mon_an=@tmp
GO
--Tính toán hạng thẻ
CREATE OR ALTER PROCEDURE sp_cap_nhat_hang_the
    @ma_the INT
AS
BEGIN
    DECLARE @ngay_dat_cap_moi DATETIME;
    DECLARE @ngay_1_nam_sau DATETIME;
    DECLARE @tong_tien INT=0;
    DECLARE @hang_the NVARCHAR(10);
    --Kiểm trả thẻ
    IF NOT EXISTS(SELECT 1 FROM THE WHERE ma_the=@ma_the)
    BEGIN
        RAISERROR('Thẻ không tồn tại',16,1);
        RETURN;
    END
    --Lấy ngày đạt cấp mới hiện tại
    SELECT @ngay_dat_cap_moi = ngay_dat_cap_moi
    FROM THE
    WHERE ma_the = @ma_the;
    --Tính ngày 1 năm sau
    SET @ngay_1_nam_sau = DATEADD(YEAR, 1, @ngay_dat_cap_moi);
    --TÍnh tổng tiền trong vòng 1 năm
    SELECT @tong_tien=ISNULL(SUM(tong_tien), 0)
    FROM HOA_DON 
    WHERE ma_the=@ma_the
    AND ngay_xuat BETWEEN @ngay_dat_cap_moi AND @ngay_1_nam_sau
    --Tính lại ngày đạt cấp mới
    SELECT @ngay_dat_cap_moi=MAX(ngay_xuat)
    FROM HOA_DON
    WHERE ma_the=@ma_the
    --Lấy hạng thẻ hiện tại
    SELECT @hang_the=hang_the FROM THE WHERE ma_the=@ma_the
    
    IF @hang_the='membership'
    BEGIN
        IF @tong_tien >=10000000
        BEGIN
            UPDATE THE 
            SET hang_the='silver',ngay_dat_cap_moi =@ngay_dat_cap_moi
            WHERE ma_the=@ma_the
        END  
        ELSE IF GETDATE()>=@ngay_1_nam_sau
        BEGIN
            UPDATE THE
            SET ngay_dat_cap_moi=@ngay_1_nam_sau
            WHERE ma_the = @ma_the
        END
    END
    
    IF @hang_the='silver'
    BEGIN
        IF @tong_tien >=10000000 
        BEGIN
            UPDATE THE
            SET hang_the = 'gold',ngay_dat_cap_moi = @ngay_dat_cap_moi
            WHERE ma_the = @ma_the;
            
        END  
        ELSE IF @tong_tien >=5000000 AND GETDATE()>=@ngay_1_nam_sau
        BEGIN
            UPDATE THE
            SET ngay_dat_cap_moi=@ngay_1_nam_sau
            WHERE ma_the = @ma_the
        END
        ELSE IF GETDATE()>=@ngay_1_nam_sau
        BEGIN
            UPDATE THE 
            SET hang_the='membership',ngay_dat_cap_moi = @ngay_1_nam_sau
            WHERE ma_the=@ma_the
        END
    END

    IF @hang_the='gold'
    BEGIN
        IF @tong_tien >=10000000 AND GETDATE()>=@ngay_1_nam_sau
        BEGIN
            UPDATE THE
            SET ngay_dat_cap_moi=@ngay_1_nam_sau
            WHERE ma_the = @ma_the
           
        END  
        ELSE IF GETDATE()>=@ngay_1_nam_sau
        BEGIN
            UPDATE THE 
            SET hang_the='silver',ngay_dat_cap_moi = @ngay_1_nam_sau
            WHERE ma_the=@ma_the
        END
    END     
END
GO
-- Thanh toán
CREATE OR ALTER PROCEDURE sp_thanh_toan
    @ma_phieu INT,
    @sdt CHAR(10),
    @nhan_vien_thanh_toan INT
AS
BEGIN
    DECLARE @tong_tien FLOAT;
    DECLARE @so_tien_duoc_giam FLOAT;
    DECLARE @tong_tien_can_tra INT;
    DECLARE @hang_the NVARCHAR(10);
    DECLARE @ma_cn INT;
    DECLARE @ma_the INT;

    IF NOT EXISTS(SELECT 1 FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu)
    BEGIN
        RAISERROR('Phiếu đặt không tồn tại',16,1);
        RETURN;
    END
    
    SELECT @ma_cn=ma_chi_nhanh FROM PHIEU_DAT WHERE ma_phieu=@ma_phieu
    IF NOT EXISTS (SELECT 1 
                   FROM LICH_SU_LAM_VIEC 
                   WHERE ma_nv = @nhan_vien_thanh_toan
                   AND ma_chi_nhanh=@ma_cn
                   AND GETDATE() <= ISNULL(thoi_gian_ket_thuc,GETDATE()))
    BEGIN 
        RAISERROR('Nhân viên không tồn tại', 16, 1);
        RETURN;
    END

    SELECT @tong_tien = SUM(ctpd.so_luong * ctpd.don_gia)
    FROM CHI_TIET_PHIEU_DAT ctpd
    WHERE ctpd.ma_phieu = @ma_phieu;

    SELECT @ma_the= ma_the FROM THE WHERE sdt=@sdt;
    BEGIN TRANSACTION
    BEGIN TRY
        IF @ma_the IS NOT NULL
        BEGIN
            --Cập nhật hạng thẻ
            EXEC sp_cap_nhat_hang_the @ma_the = @ma_the;

            SELECT @hang_the = hang_the
            FROM THE 
            WHERE ma_the = @ma_the;

            IF @hang_the = 'membership'
            BEGIN
                SET @tong_tien_can_tra = ROUND(@tong_tien * 0.90,0);
                SET @so_tien_duoc_giam=@tong_tien * 0.10;
            END

            IF @hang_the = 'silver'
            BEGIN
                SET @tong_tien_can_tra = ROUND(@tong_tien * 0.80,0);
                SET @so_tien_duoc_giam=@tong_tien * 0.20;
            END

            IF @hang_the = 'gold'
            BEGIN
                SET @tong_tien_can_tra = ROUND(@tong_tien * 0.70,0);
                SET @so_tien_duoc_giam=@tong_tien * 0.30;
            END
        END  

        ELSE 
        BEGIN
            SET @tong_tien_can_tra = ROUND(@tong_tien, 0);
            SET @so_tien_duoc_giam = 0;
        END

        INSERT INTO HOA_DON(ma_phieu,tong_tien,so_tien_duoc_giam,tong_tien_can_tra,ngay_xuat,nhan_vien_thanh_toan,ma_the)
        VALUES (@ma_phieu,@tong_tien,@so_tien_duoc_giam,@tong_tien_can_tra,GETDATE(),@nhan_vien_thanh_toan,@ma_the)

        UPDATE PHIEU_DAT
        SET trang_thai=N'Đã thanh toán'
        WHERE ma_phieu=@ma_phieu

        COMMIT TRANSACTION;
    END TRY  
    BEGIN CATCH
        ROLLBACK;
    END CATCH
END
GO
--cập nhật thẻ khách hàng hằng tuần
CREATE OR ALTER PROCEDURE sp_cap_nhat_hang_the_hang_tuan
AS
BEGIN
    DECLARE @ma_the INT;
    DECLARE cur_ma_the CURSOR FOR SELECT ma_the FROM THE;
    OPEN cur_ma_the;    
    FETCH NEXT FROM cur_ma_the INTO @ma_the;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_cap_nhat_hang_the @ma_the = @ma_the;
        FETCH NEXT FROM cur_ma_the INTO @ma_the;
    END
    CLOSE cur_ma_the;
    DEALLOCATE cur_ma_the;
END
GO
-----------tinh diem
create or alter function fn_tinh_diem_the (@ma_the int)
returns float
as
begin
    declare @tong_diem float;
    if not exists (
        select 1
        from the
        where ma_the = @ma_the
    )
    begin
        return null;
    end
    select @tong_diem = sum(tong_tien / 100000.0)
    from hoa_don
    where ma_the = @ma_the;

    if @tong_diem is null
    begin
        return 0;
    end

    return @tong_diem;
end;
go
---Tìm kiếm hóa đơn theo khách hàng từ ngày->đến ngày
CREATE OR ALTER PROC sp_tim_kiem_hoa_don
    @sdt CHAR(10),
    @tu_ngay DATETIME,
    @den_ngay DATETIME
AS
BEGIN
    DECLARE @ma_the INT;
    SELECT @ma_the=ma_the FROM THE WHERE sdt=@sdt;

    IF @ma_the IS NOT NULL
    BEGIN
        SELECT* FROM HOA_DON
        WHERE ma_the=@ma_the AND ngay_xuat BETWEEN @tu_ngay AND @den_ngay;
    END
    ELSE BEGIN
        RAISERROR('Khách hàng không có thẻ',16,1);
    END
END
GO

-- exec sp_tim_kiem_hoa_don
--     @sdt='0901027993',
--     @tu_ngay='2022-1-1',
--     @den_ngay='2024-11-30'
-- Tạo đơn hàng online

CREATE OR ALTER PROCEDURE sp_tao_don_hang_online
    @ma_tk INT,
    @sdt CHAR(10),
    @ma_cn INT,
    @loai_dat NVARCHAR(10),
    @dia_chi NVARCHAR(100),
    @ngay_giao DATETIME
AS   
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE ma_cn=@ma_cn)
    BEGIN
        RAISERROR('Chi nhánh không tồn tại',16,1);
        RETURN;
    END
    INSERT INTO DON_HANG_ONLINE(sdt,ma_cn,loai_dat,dia_chi,ngay_giao,ma_tk)
    VALUES (@sdt,@ma_cn,@loai_dat,@dia_chi,@ngay_giao,@ma_tk);      
END
GO
-- EXEC sp_tao_don_hang_online @sdt = '0388774430',
--     @ma_cn = 1,
--     @loai_dat = 'ship',
--     @dia_chi = 'abcd'

-- Tạo chi tiết đơn hàng online
CREATE OR ALTER PROCEDURE sp_them_chi_tiet_don_hang_online
    @ma_dh INT,
    @ma_mon INT,
    @so_luong INT
AS 
BEGIN
    DECLARE @ma_cn INT;
    SELECT @ma_cn=ma_cn FROM DON_HANG_ONLINE WHERE ma_dh=@ma_dh;
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
    INSERT INTO CHI_TIET_DON_HANG_ONLINE (ma_dh, ma_mon, so_luong)
    VALUES (@ma_dh, @ma_mon, @so_luong);
END
GO
-- Cập nhật chi tiết đơn hàng online
CREATE OR ALTER PROCEDURE sp_cap_nhat_chi_tiet_don_hang_online
    @ma_dh INT,
    @ma_mon INT,
    @so_luong INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM CHI_TIET_DON_HANG_ONLINE WHERE ma_dh = @ma_dh AND ma_mon = @ma_mon)
    BEGIN
        RAISERROR('Chi tiết đơn hàng online không tồn tại', 16, 1);
        RETURN;
    END
    UPDATE CHI_TIET_DON_HANG_ONLINE
    SET so_luong = @so_luong
    WHERE ma_dh = @ma_dh AND ma_mon = @ma_mon;
END;
GO
--Xóa chi tiết đơn hàng online
CREATE OR ALTER PROC sp_xoa_chi_tiet_don_hang_online
    @ma_dh INT,
    @ma_mon INT
AS
BEGIN
    IF NOT EXISTS(SELECT* FROM CHI_TIET_DON_HANG_ONLINE WHERE ma_dh=@ma_dh AND ma_mon=@ma_mon)
    BEGIN
        RAISERROR('Chi tiết đơn hàng online không tồn tại',16,1);
        RETURN;
    END
    DELETE FROM CHI_TIET_DON_HANG_ONLINE WHERE ma_dh=@ma_dh AND ma_mon=@ma_mon;
END
GO
--Tạo đơn hàng online và thêm danh sách món ăn vào đơn hàng online
CREATE OR ALTER PROCEDURE sp_tao_don_hang_online_va_them_mon 
    @ma_tk INT,
    @sdt CHAR(10),
    @ma_cn INT,
    @loai_dat NVARCHAR(10),
    @dia_chi NVARCHAR(100),
    @ngay_giao DATETIME,
    @ds_mon_an AS DS_MON_AN READONLY
AS 
BEGIN
    DECLARE @ma_dh INT;
    DECLARE @ma_mon INT;
    DECLARE @so_luong INT;
    BEGIN TRANSACTION;
    BEGIN TRY;
        EXEC sp_tao_don_hang_online
            @sdt=@sdt,
            @ma_cn=@ma_cn,
            @loai_dat=@loai_dat,
            @dia_chi=@dia_chi,
            @ngay_giao=@ngay_giao,
            @ma_tk=@ma_tk

        SELECT @ma_dh=MAX(ma_dh) FROM DON_HANG_ONLINE;
        --Tạo cursor
        DECLARE cur CURSOR FOR
        SELECT ma_mon, so_luong
        FROM @ds_mon_an;
        OPEN cur;
        FETCH NEXT FROM cur INTO @ma_mon, @so_luong;
        --Duyệt từng danh sách món ăn
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC sp_them_chi_tiet_don_hang_online
                @ma_dh = @ma_dh, 
                @ma_mon = @ma_mon, 
                @so_luong = @so_luong;
            FETCH NEXT FROM cur INTO @ma_mon, @so_luong;
        END;
        CLOSE cur;
        DEALLOCATE cur;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        RAISERROR('Lỗi',16,1);
        ROLLBACK TRANSACTION;
    END CATCH
END
GO
---------
-- DECLARE @tmp DS_MON_AN;
-- INSERT INTO @tmp VALUES (25, 2) ,(24, 2)
-- EXEC sp_tao_don_hang_online_va_them_mon 
--     @sdt = '0388774430',
--     @ma_cn = 12,
--     @loai_dat = 'ship',
--     @dia_chi = 'abcd',
--     @ds_mon_an = @tmp

