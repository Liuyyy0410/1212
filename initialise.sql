CREATE DATABASE IF NOT EXISTS db_theatre;
USE db_theatre;

SET foreign_key_checks=0;

-- 删除旧表
DROP TABLE IF EXISTS movie_genres;
DROP TABLE IF EXISTS booked_tickets;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS price_listing;
DROP TABLE IF EXISTS hall_seats;
DROP TABLE IF EXISTS halls;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS types; -- 确保旧表被删

-- 1. 影厅表 (实体)
CREATE TABLE halls (
    hall_id INT PRIMARY KEY
);

-- 2. 影厅座位配置 (属性)
CREATE TABLE hall_seats (
    hall_id INT,
    class VARCHAR(10),
    total_seats INT, 
    PRIMARY KEY(hall_id, class),
    FOREIGN KEY(hall_id) REFERENCES halls(hall_id) ON DELETE CASCADE
);

-- 3. 电影表 (实体)
CREATE TABLE movies (
    movie_id INT PRIMARY KEY,
    movie_name VARCHAR(100),
    length INT,
    language VARCHAR(20),
    show_start DATE,
    show_end DATE
);

-- 4. 电影题材 
CREATE TABLE movie_genres (
    movie_id INT,
    genre VARCHAR(20),
    PRIMARY KEY(movie_id, genre),
    FOREIGN KEY(movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
);

-- 5. 价目表 (规则)
CREATE TABLE price_listing (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(10), -- 2D, 3D, 4DX
    day VARCHAR(10),  -- Monday, Tuesday...
    price INT,
    UNIQUE KEY(type, day) -- 确保唯一性，方便查询
);

-- 6. 排片表 
CREATE TABLE shows (
    show_id INT PRIMARY KEY,
    movie_id INT,
    hall_id INT,
    type VARCHAR(10), -- 只需要存储制式，价格通过 (type + date) 动态计算
    time INT,
    show_date DATE,
  
    FOREIGN KEY(movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY(hall_id) REFERENCES halls(hall_id) ON DELETE CASCADE

);

-- 7. 订单表 
CREATE TABLE booked_tickets (
    ticket_no INT PRIMARY KEY,
    show_id INT,
    seat_no INT,
    FOREIGN KEY(show_id) REFERENCES shows(show_id) ON DELETE CASCADE
);

SET foreign_key_checks=1;

-- 初始化数据
INSERT INTO halls VALUES (1), (2), (3);

INSERT INTO hall_seats VALUES
(1, "gold", 35), (1, "standard", 75), 
(2, "gold", 27), (2, "standard", 97), 
(3, "gold", 26), (3, "standard", 98);

-- 基础价目表
INSERT INTO price_listing (type, day, price) VALUES
('2D', 'Monday', 30), ('3D', 'Monday', 45), ('4DX', 'Monday', 60),
('2D', 'Tuesday', 30), ('3D', 'Tuesday', 45), ('4DX', 'Tuesday', 60),
('2D', 'Wednesday', 30), ('3D', 'Wednesday', 45), ('4DX', 'Wednesday', 60),
('2D', 'Thursday', 30), ('3D', 'Thursday', 45), ('4DX', 'Thursday', 60),
('2D', 'Friday', 50), ('3D', 'Friday', 65), ('4DX', 'Friday', 90),
('2D', 'Saturday', 60), ('3D', 'Saturday', 75), ('4DX', 'Saturday', 100),
('2D', 'Sunday', 60), ('3D', 'Sunday', 75), ('4DX', 'Sunday', 100);

-- 1. 阿凡达3：火与灰
INSERT INTO movies VALUES (101, '阿凡达：火与灰 (Avatar: Fire and Ash)', 190, '英语', '2025-12-19', '2026-02-28');
INSERT INTO movie_genres VALUES (101, '动作'), (101, '奇幻'), (101, '科幻');

-- 2. 海绵宝宝大电影：寻找方裤裤
INSERT INTO movies VALUES (102, '海绵宝宝：寻找方裤裤', 95, '英语/国语', '2025-12-19', '2026-01-30');
INSERT INTO movie_genres VALUES (102, '动画'), (102, '喜剧'), (102, '家庭');

-- 3. 女佣 (The Housemaid)
INSERT INTO movies VALUES (103, '女佣 (The Housemaid)', 110, '英语', '2025-12-19', '2026-01-20');
INSERT INTO movie_genres VALUES (103, '惊悚'), (103, '悬疑'), (103, '剧情');

-- 4. 大卫 (David)
INSERT INTO movies VALUES (104, '大卫王 (David)', 100, '英语', '2025-12-19', '2026-01-15');
INSERT INTO movie_genres VALUES (104, '动画'), (104, '历史'), (104, '音乐');

-- 5. 这玩意儿开着吗 (Is This Thing On?)
INSERT INTO movies VALUES (105, '这玩意儿开着吗?', 105, '英语', '2025-12-19', '2026-01-15');
INSERT INTO movie_genres VALUES (105, '喜剧'), (105, '剧情'), (105, '独立');

-- 6. 马蒂至尊 (Marty Supreme)
INSERT INTO movies VALUES (106, '马蒂至尊 (Marty Supreme)', 125, '英语', '2025-12-25', '2026-02-10');
INSERT INTO movie_genres VALUES (106, '剧情'), (106, '运动'), (106, '传记');

-- 7. 蓝色歌唱 (Song Sung Blue)
INSERT INTO movies VALUES (107, '蓝色歌唱 (Song Sung Blue)', 115, '英语', '2025-12-25', '2026-01-30');
INSERT INTO movie_genres VALUES (107, '音乐'), (107, '爱情'), (107, '剧情');

-- 8. 狂蟒之灾：重生 (Anaconda)
INSERT INTO movies VALUES (108, '狂蟒之灾：重生', 100, '英语', '2025-12-25', '2026-01-25');
INSERT INTO movie_genres VALUES (108, '恐怖'), (108, '动作'), (108, '惊悚');

-- 9. 大洪水 (The Great Flood)
INSERT INTO movies VALUES (109, '末日大洪水 (The Great Flood)', 130, '英语', '2025-12-25', '2026-01-30');
INSERT INTO movie_genres VALUES (109, '灾难'), (109, '科幻'), (109, '动作');

-- 10. 六月再见 (Goodbye June)
INSERT INTO movies VALUES (110, '六月再见 (Goodbye June)', 105, '英语', '2025-12-20', '2026-01-10');
INSERT INTO movie_genres VALUES (110, '家庭'), (110, '剧情'), (110, '节日');

-- 插入示范排片 (价格会自动设置)
INSERT INTO shows (show_id, movie_id, hall_id, type, time, show_date) VALUES 
(1001, 101, 1, '3D', 1000, '2025-12-25'),  -- 阿凡达 早上10点
(1002, 101, 1, '4DX', 1400, '2025-12-25'), -- 阿凡达 下午2点
(1003, 106, 2, '2D', 1830, '2025-12-25'),  -- 马蒂至尊 晚上6点半
(1004, 108, 3, '2D', 2100, '2025-12-25'),  -- 狂蟒之灾 晚上9点
(1005, 102, 2, '2D', 1000, '2025-12-26'),  -- 海绵宝宝：寻找方裤裤
(1006, 103, 3, '2D', 2100, '2025-12-26'),  -- 女佣 (The Housemaid)
(1007, 104, 1, '2D', 1300, '2025-12-26'),  -- 大卫王 (David)
(1008, 105, 2, '2D', 1900, '2025-12-26'),  -- 这玩意儿开着吗?
(1009, 107, 3, '2D', 1600, '2025-12-26'),  -- 蓝色歌唱 (Song Sung Blue)
(1010, 109, 1, '3D', 1400, '2025-12-26'),  -- 末日大洪水 (The Great Flood)
(1011, 110, 2, '2D', 1800, '2025-12-26');  -- 六月再见 (Goodbye June)

-- 存储过程
DROP PROCEDURE IF EXISTS delete_old;
DELIMITER //
CREATE PROCEDURE delete_old()
BEGIN
    DELETE FROM shows WHERE show_date < CURDATE();
END; //
DELIMITER ;