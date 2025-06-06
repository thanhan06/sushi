
CREATE DATABASE sushi_db
GO

USE sushi_db
GO

-- Table KHU_VUC
CREATE TABLE KHU_VUC (
    ten_kv NVARCHAR(50) PRIMARY KEY 
);
GO

-- Table TAI_KHOAN
CREATE TABLE TAI_KHOAN (
    ma_tk INT IDENTITY(1, 1) PRIMARY KEY,
    ten_tai_khoan VARCHAR(50) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro NVARCHAR(5) NOT NULL CHECK(vai_tro IN ('admin', 'nv','kh')) DEFAULT('kh')
);
GO

-- Table BO_PHAN
CREATE TABLE BO_PHAN (
    ma_bp INT IDENTITY(1, 1) PRIMARY KEY,
    ten_bp NVARCHAR(50) UNIQUE,
    luong INT NOT NULL CHECK(luong > 0)
);
GO

-- Table NHAN_VIEN
CREATE TABLE NHAN_VIEN (
    ma_nv INT IDENTITY(1, 1) PRIMARY KEY,
    ma_tk INT FOREIGN KEY REFERENCES TAI_KHOAN(ma_tk),
    ho_ten NVARCHAR(50) NOT NULL,
    gioi_tinh NVARCHAR(5) CHECK(gioi_tinh IN ('Nam', 'Nu', 'Khac')),
    sdt CHAR(10) UNIQUE NOT NULL,
    dia_chi NVARCHAR(50),
    ngay_sinh DATETIME,
    ma_bo_phan INT FOREIGN KEY REFERENCES BO_PHAN(ma_bp)
);
GO

-- Table CHI_NHANH
CREATE TABLE CHI_NHANH (
    ma_cn INT IDENTITY(1, 1) PRIMARY KEY,
    ten_cn NVARCHAR(50) NOT NULL,
    dia_chi NVARCHAR(50) UNIQUE,
    hotline CHAR(10) NOT NULL,
    ma_nv_ql INT FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv),
    gio_mo_cua TIME,
    gio_dong_cua TIME,
    bai_do_xe_may CHAR(1) CHECK (bai_do_xe_may IN('T', 'F')),
    bai_do_xe_oto CHAR(1) CHECK (bai_do_xe_oto IN('T', 'F')),
    ten_kv NVARCHAR(50) FOREIGN KEY REFERENCES KHU_VUC(ten_kv),
    giao_hang CHAR(1) CHECK (giao_hang IN('T', 'F'))
);
GO

-- Table LOAI_MON_AN
CREATE TABLE LOAI_MON_AN (
    ma_loai INT IDENTITY(1, 1) PRIMARY KEY,
    ten_loai NVARCHAR(50) UNIQUE
);
GO

-- Table MON_AN
CREATE TABLE MON_AN (
    ma_mon INT IDENTITY(1, 1) PRIMARY KEY,
    ten_mon NVARCHAR(50) UNIQUE,
    gia INT NOT NULL CHECK(gia > 0),
    loai INT FOREIGN KEY REFERENCES LOAI_MON_AN(ma_loai) NOT NULL,
    gia_hien_tai INT NOT NULL CHECK(gia_hien_tai > 0),
    giao_hang CHAR(1) CHECK(giao_hang IN ('T', 'F'))
);
GO

-- Table CT_THUC_DON
CREATE TABLE CT_THUC_DON (
    ma_mon INT FOREIGN KEY REFERENCES MON_AN(ma_mon),
    ten_kv NVARCHAR(50) FOREIGN KEY REFERENCES KHU_VUC(ten_kv),
    PRIMARY KEY (ma_mon, ten_kv)
);
GO

-- Table MON_KHONG_PV
CREATE TABLE MON_KHONG_PV (
    ma_mon INT FOREIGN KEY REFERENCES MON_AN(ma_mon),
    ma_cn INT FOREIGN KEY REFERENCES CHI_NHANH(ma_cn),
    PRIMARY KEY (ma_mon, ma_cn)
);
GO

-- Table LICH_SU_LAM_VIEC
CREATE TABLE LICH_SU_LAM_VIEC (
    ma_nv INT FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv),
    ma_chi_nhanh INT FOREIGN KEY REFERENCES CHI_NHANH(ma_cn),
    thoi_gian_bat_dau DATETIME,
    thoi_gian_ket_thuc DATETIME,
    PRIMARY KEY(ma_nv, ma_chi_nhanh, thoi_gian_bat_dau),
    CHECK(thoi_gian_bat_dau < thoi_gian_ket_thuc)
);
GO

-- Table THE
CREATE TABLE THE (
    ma_the INT IDENTITY(1, 1) PRIMARY KEY,
    nv_lap_the INT FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv) NOT NULL,
    hang_the NVARCHAR(10) NOT NULL CHECK(hang_the IN ('membership', 'silver', 'gold')) DEFAULT('membership'),
    ngay_lap DATETIME NOT NULL DEFAULT(GETDATE()),
    ngay_dat_cap_moi DATETIME NOT NULL DEFAULT(GETDATE()),
    ho_ten NVARCHAR(50),
    cccd CHAR(12) UNIQUE,
    sdt CHAR(10) UNIQUE,
    email NVARCHAR(50) UNIQUE,
    gioi_tinh NVARCHAR(5) CHECK(gioi_tinh IN ('Nam', 'Nu', 'Khac'))
);
GO

-- Table BAN_DAT
CREATE TABLE BAN_DAT (
    ma_chi_nhanh INT FOREIGN KEY REFERENCES CHI_NHANH(ma_cn),
    ma_ban INT ,
    PRIMARY KEY(ma_chi_nhanh, ma_ban)
);
GO

-- Table PHIEU_DAT
CREATE TABLE PHIEU_DAT (
    ma_phieu INT IDENTITY(1, 1) PRIMARY KEY,
    ma_chi_nhanh INT,
    ma_ban INT,
    nv_lap INT FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv) NOT NULL,
    ngay_lap DATETIME NOT NULL,
    ngay_den DATETIME NOT NULL,
    trang_thai NVARCHAR(20) DEFAULT N'Chưa thanh toán',
    CONSTRAINT fk_phieu_dat_ban_dat FOREIGN KEY (ma_chi_nhanh, ma_ban) REFERENCES BAN_DAT(ma_chi_nhanh, ma_ban)
);
GO

-- Table CHI_TIET_PHIEU_DAT
CREATE TABLE CHI_TIET_PHIEU_DAT (
    ma_phieu INT FOREIGN KEY REFERENCES PHIEU_DAT(ma_phieu),
    ma_mon INT FOREIGN KEY REFERENCES MON_AN(ma_mon),
    so_luong INT NOT NULL CHECK(so_luong > 0),
    don_gia INT,
    PRIMARY KEY(ma_phieu, ma_mon)
);
GO

-- Table HOA_DON
CREATE TABLE HOA_DON (
    ma_phieu INT FOREIGN KEY REFERENCES PHIEU_DAT(ma_phieu),
    tong_tien FLOAT NOT NULL CHECK(tong_tien > 0),
    so_tien_duoc_giam FLOAT NOT NULL CHECK(so_tien_duoc_giam >= 0),
    tong_tien_can_tra FLOAT NOT NULL CHECK(tong_tien_can_tra > 0),
    ngay_xuat DATETIME NOT NULL,
    nhan_vien_thanh_toan INT FOREIGN KEY REFERENCES NHAN_VIEN(ma_nv),
    ma_the INT FOREIGN KEY REFERENCES THE(ma_the),
    PRIMARY KEY (ma_phieu)
);
GO

-- Table DANH_GIA
CREATE TABLE DANH_GIA (
    ma_phieu INT FOREIGN KEY REFERENCES PHIEU_DAT(ma_phieu),
    diem_vi_tri INT,
    diem_phuc_vu INT,
    diem_mon_an INT,
    diem_gia_ca INT,
    diem_khong_gian INT,
    binh_luan NVARCHAR(500),
    PRIMARY KEY (ma_phieu)
);
GO

-- Table TT_KHACH_HANG
CREATE TABLE TT_KHACH_HANG (
    ma_tk INT PRIMARY KEY,
    ho_ten NVARCHAR(50) NOT NULL,   
    sdt CHAR(10) UNIQUE NOT NULL,
    dia_chi NVARCHAR(50),
    CONSTRAINT fk_tt_khach_hang_tai_khoan FOREIGN KEY(ma_tk) REFERENCES TAI_KHOAN(ma_tk)
);
GO

-- Table TRUY_CAP
CREATE TABLE TRUY_CAP (
    tai_khoan INT,
    thoi_diem DATETIME,
    thoi_gian FLOAT NOT NULL CHECK(thoi_gian >= 0),
    PRIMARY KEY(tai_khoan, thoi_diem),
    CONSTRAINT fk_truy_cap_tai_khoan FOREIGN KEY(tai_khoan) REFERENCES TAI_KHOAN(ma_tk)
);
GO

CREATE TABLE DON_HANG_ONLINE(
    ma_dh INT IDENTITY(1,1) PRIMARY KEY,
    sdt CHAR(10),
    ma_cn INT,
    loai_dat NVARCHAR(10),
    trang_thai NVARCHAR(20) DEFAULT N'Chưa xác nhận',
    dia_chi NVARCHAR(100),
    ngay_giao DATETIME,
    ma_phieu INT,
    ma_tk INT
);
GO
CREATE TABLE CHI_TIET_DON_HANG_ONLINE(
    ma_dh INT,
    ma_mon INT,
    so_luong INT,
    FOREIGN KEY(ma_dh) REFERENCES DON_HANG_ONLINE(ma_dh),
    PRIMARY KEY(ma_dh, ma_mon)
);
GO

CREATE OR ALTER VIEW NHAN_VIEN_DANG_LV AS 
SELECT DISTINCT nv.*, ls.ma_chi_nhanh
FROM NHAN_VIEN nv
JOIN LICH_SU_LAM_VIEC ls ON ls.ma_nv = nv.ma_nv
WHERE ls.thoi_gian_ket_thuc IS NULL
;
GO

CREATE OR ALTER VIEW CT_THUC_DON_CHI_NHANH AS
SELECT DISTINCT cn.ma_cn, ct.ma_mon
FROM CT_THUC_DON ct
JOIN CHI_NHANH cn ON cn.ten_kv = ct.ten_kv
EXCEPT 
SELECT ma_cn, ma_mon
FROM MON_KHONG_PV
;
GO

/*

use master
go
drop database sushi_db

*/
