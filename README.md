# 影院售票管理系统 (Cinema Ticketing System)

## 项目简介
本项目是《数据库系统》课程期末大作业。系统旨在为电影院提供一套高效的信息管理解决方案，通过 B/S 架构（浏览器/服务器）实现对影片排期、票务销售、影厅座位及价格策略的全流程数字化管理，替代传统低效的人工记录模式。

## 核心功能
* **票务前台 (Cashier)**：
    * **可视化选座**：支持按影厅布局查看座位状态（可选/已售/已选），区分金牌座位（Gold）与普通座位（Standard）。
    * **实时购票**：自动计算票价（含等级加价策略），生成唯一票号，防止座位冲突。
    * **排片查询**：按日期查看上映电影及具体场次。
* **后台管理 (Manager)**：
    * **影片与排期管理**：录入新电影信息（时长、语言、类型），设置上映起止时间及具体场次安排。
    * **影厅调度**：智能检测影厅空闲状态，避免排片时间冲突。
    * **票价策略**：动态调整不同类型影片的基础票价，系统自动应用到前端销售。
* **数据完整性**：
    * 基于 MySQL 关系型数据库，符合 3NF 设计规范。
    * 后端集成存储过程与事务处理，确保高并发下的售票数据一致性。

## 技术栈
* **前端**：HTML5, CSS3, JavaScript (jQuery), Bootstrap (UI 布局)
* **后端**：Python 3.x, Flask 框架
* **数据库**：MySQL (支持存储过程与事务)

## 快速开始

### 1. 环境准备
确保本地已安装以下环境：
* Python (建议 v3.8+)
* MySQL 数据库 (建议 v8.0+)

### 2. 数据库配置
1.  登录 MySQL，创建一个名为 `db_theatre` 的数据库。
2.  导入项目提供的 SQL 脚本（如 `theatre_DDL.sql`），初始化表结构、存储过程及初始数据。
3.  打开项目根目录下的 `app.py` 文件，修改 `db_config` 字典，填入你的数据库连接信息：

    ```python
    db_config = {
        'host': 'localhost',
        'database': 'db_theatre',
        'user': 'root',      // 你的MySQL用户名
        'password': 'your_password' // 你的MySQL密码
    }
    ```

### 3. 安装依赖
在项目根目录下打开终端，运行：

    pip install flask mysql-connector-python

### 4. 启动项目
使用以下命令启动 Flask 服务器：

    python app.py

### 5. 访问系统
服务器启动成功后（控制台显示 Running on http://...），打开浏览器访问：
`http://localhost:5000`

**默认账号**：
* **经理 (Manager)**: 用户名 `manager` / 密码 `manager`
* **收银员 (Cashier)**: 用户名 `cashier` / 密码 `cashier`

## 作者信息
* **姓名**：YuPeng Liu
