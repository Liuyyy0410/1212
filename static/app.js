var username = null;
var password = null;
// 全局变量
var memberID = null; 
var currentMemberData = null; 
var snackCart = []; 

// 临时变量
var date = null;
var movieID = null;
var type = null;
var seatNo = null;
var seatClass = null;
var showID = null;
var startShowing = null;
var endShowing = null;
var showTime = null;
var showDate = null;
var priceID = null;

function login(){
	if(username === null){
		username = $("[name='username']")[0].value;
		password = $("[name='password']")[0].value;
	}
	var form = {
		'username' : username,
		'password' : password
	};
	$.ajax({
		type: 'POST',
		url: '/login',
		data: form,
		success: function(response){
			$('.module').html(response);
			$('.module').addClass('module-after-login');
			$('.login-header').addClass('after-login');
			if(username == 'cashier'){
				// 登录后默认显示购票，但不再锁死按钮
				viewBooking();
			}
		}
	});
}

// 辅助：重置收银员动态区域
function resetCashier(){
	$('#cashier-dynamic-1').html('');
	$('#cashier-dynamic-2').html('');
	$('#cashier-dynamic-3').html('');
	$('#cashier-dynamic-4').html('');
	// 关键修改：收银员模式下，永远不禁用顶部导航按钮
	$('#options button').prop('disabled', false);
}

// ==========================================
//   视图切换逻辑 (已修复：不再禁用按钮)
// ==========================================

function viewMembership() {
	resetCashier();
	// 界面：简洁风格，两行输入
	$('#cashier-dynamic-1').html(`
		<h6 style="color:white; margin-bottom:15px; border-left: 3px solid #ffc107; padding-left: 8px;">会员管理</h6>
		<div style="margin-bottom: 20px;">
			<span style="color: #ccc; font-size: 14px;">查询现有: </span>
			<input id="member-phone" placeholder="输入手机号" style="width: 200px;">
			<button onclick="checkMember()">查询</button>
		</div>
		<div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
			<span style="color: #ccc; font-size: 14px;">注册新号: </span>
			<input id="new-member-phone" placeholder="手机号" style="width: 150px;">
			<input id="new-member-name" placeholder="姓名" style="width: 150px;">
			<button onclick="registerMember()">注册</button>
		</div>
		<div id="member-msg" style="margin-top:15px; font-size: 16px;"></div>
	`);
}

function viewBooking() {
	resetCashier();
	// 恢复原有的 pickadate 风格
	$('#cashier-dynamic-1').html(`
		<h6 style="color:white; margin-bottom:15px; border-left: 3px solid #ffc107; padding-left: 8px;">电影购票</h6>
		<input id="datepicker-cashier" placeholder="点击选择日期 (Pick a date)" style="width: 300px;">
	`);
	
	$('#datepicker-cashier').pickadate({
		min : new Date(),
		formatSubmit: 'yyyy-mm-dd', 
		hiddenName: true,
		onSet: function( event ) {
			if ( event.select ) {
				// 只有选了日期，才禁用这个日期框，防止误触，但顶部导航依然可用
				$('#datepicker-cashier').prop('disabled', true);
				getMoviesShowingOnDate(this.get('select', 'yyyy-mm-dd' ));
			}
		}
	});
}

function viewSnacks() {
	resetCashier();
	// 简洁布局
	$('#cashier-dynamic-1').html(`
		<h6 style="color:white; margin-bottom:15px; border-left: 3px solid #ffc107; padding-left: 8px;">小吃售卖</h6>
		<div id="snack-list-container" style="margin-bottom: 20px;">加载中...</div>
		<div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
			<h6 style="color:#ccc;">当前购物车</h6>
			<div id="snack-cart-container" style="color:white; font-size: 15px;">(空)</div>
		</div>
	`);
	loadSnacks();
}

// ==========================================
//   1. 会员逻辑
// ==========================================

function updateMemberStatusUI() {
	if (memberID) {
		$('#current-member-name').html(`${currentMemberData.name} <span style="font-size:12px; color:#ccc;">(积分: ${currentMemberData.points})</span>`);
		$('#current-member-name').css('color', '#28a745'); // Green for active
		$('#btn-member-logout').show();
	} else {
		$('#current-member-name').html('无 (Guest)');
		$('#current-member-name').css('color', '#ffc107'); // Yellow for guest
		$('#btn-member-logout').hide();
	}
}

function logoutMember() {
	memberID = null;
	currentMemberData = null;
	updateMemberStatusUI();
	if($('#member-msg').length) $('#member-msg').html('已登出');
}

function checkMember(){
	var phone = $('#member-phone').val();
	if(!phone) return;
	$.ajax({
		type: 'POST',
		url: '/checkMember',
		data: {'phone': phone},
		success: function(data){
			if(data.status == 'found'){
				memberID = data.id;
				currentMemberData = data;
				updateMemberStatusUI();
				$('#member-msg').html(`<span style="color:#28a745">✔ 登录成功: ${data.name}</span>`);
			} else {
				$('#member-msg').html('<span style="color:#dc3545">✖ 未找到会员</span>');
			}
		}
	});
}

function registerMember(){
	var phone = $('#new-member-phone').val();
	var name = $('#new-member-name').val();
	if(!phone || !name) return;
	$.ajax({
		type: 'POST',
		url: '/registerMember',
		data: {'phone': phone, 'name': name},
		success: function(data){
			if(data.status == 'success'){
				memberID = data.id;
				currentMemberData = {'name': name, 'points': 0};
				updateMemberStatusUI();
				$('#member-msg').html(`<span style="color:#28a745">✔ 注册成功: ${name}</span>`);
				$('#new-member-phone').val('');
				$('#new-member-name').val('');
			} else {
				$('#member-msg').html(`<span style="color:#dc3545">✖ 注册失败: ${data.msg}</span>`);
			}
		}
	});
}

// ==========================================
//   2. 购票逻辑 (Output到 dynamic-2, 3...)
// ==========================================

function getMoviesShowingOnDate(mdate){
	date = mdate;
	$.ajax({
		type: 'POST',
		url: '/getMoviesShowingOnDate',
		data: {'date' : date},
		success: function(response){
			$('#cashier-dynamic-2').html(response);
		}
	});
}
function selectMovie(movID, mtype){
	movieID = movID;
	type = mtype;
	$.ajax({
		type: 'POST',
		url: '/getTimings',
		data: {
			'date' : date,
			'movieID': movieID,
			'type' : type
		},
		success: function(response){
			// 这里只是禁用电影选择按钮，不禁用顶部导航
			$('#movies-on-date button').prop('disabled', true);
			$('#cashier-dynamic-3').html(response);
		}
	});
}
function selectTiming(mshowID){
    showID = mshowID;
    $('#timings-for-movie button').prop('disabled', true);
    getSeats();
}
function getSeats(){
	$.ajax({
		type: 'POST',
		url: '/getAvailableSeats',
		data: {'showID' : showID},
		success: function(response){
			$('#cashier-dynamic-4').html(response);
		}
	});
}
function selectSeat(no, sclass){
	seatNo = no;
	seatClass = sclass;
	// 将价格显示在座位图下方
	if($('#price-confirm-area').length == 0) {
		$('#cashier-dynamic-4').append('<div id="price-confirm-area" style="margin-top:20px;"></div>');
	}
	$.ajax({
		type: 'POST',
		url: '/getPrice',
		data: {
			'showID' : showID,
			'seatClass' : seatClass
			},
		success: function(response){
			$('#price-confirm-area').html(response);
		}
	});
}
function confirmBooking(){
	$.ajax({
		type: 'POST',
		url: '/insertBooking',
		data: {
			'showID' : showID,
			'seatNo' : seatNo,
			'seatClass' : seatClass,
			'memberID': memberID 
			},
		success: function(response){
			// 禁用座位图按钮
			$('#available-seats button').prop('disabled', true); 
			$('#price-confirm-area').html(response);
			if(memberID){
			    currentMemberData.points += 10;
			    updateMemberStatusUI();
			}
		}
	});
}

// ==========================================
//   3. 小吃逻辑
// ==========================================

function loadSnacks(){
	$.ajax({
		type: 'POST',
		url: '/getSnacks',
		success: function(data){
			var html = '';
			data.forEach(function(item){
				html += `<button onclick="addToCart(${item.id}, '${item.name}', ${item.price})" style="margin:5px 10px 5px 0;">${item.name} ¥${item.price}</button>`;
			});
			$('#snack-list-container').html(html);
		}
	});
}

function addToCart(id, name, price){
	var found = false;
	snackCart.forEach(function(item){
		if(item.id == id){
			item.qty++;
			found = true;
		}
	});
	if(!found){
		snackCart.push({'id': id, 'name': name, 'price': price, 'qty': 1});
	}
	renderCart();
}

function renderCart(){
	if(snackCart.length == 0 || snackCart.every(i => i.qty == 0)){
		$('#snack-cart-container').html('(空)');
		return;
	}

	var html = '<ul style="list-style:none; padding-left:0; margin-bottom: 10px;">';
	var total = 0;
	snackCart.forEach(function(item){
		if(item.qty > 0){
			html += `<li>${item.name} x ${item.qty} = ¥${item.price * item.qty}</li>`;
			total += item.price * item.qty;
		}
	});
	html += `</ul>`;
	html += `<div style="font-weight:bold; margin-bottom:10px; color:#ffc107;">总计: ¥${total}</div>`;
	html += `<button onclick="buySnacks()" style="margin-right:10px;">结算</button>`;
	html += `<button onclick="clearCart()">清空</button>`;
	
	$('#snack-cart-container').html(html);
}

function clearCart(){
	snackCart = [];
	renderCart();
}

function buySnacks(){
	$.ajax({
		type: 'POST',
		url: '/buySnacks',
		data: {'cart': JSON.stringify(snackCart)},
		success: function(response){
			alert('结算成功! 总价: ¥' + response.cost);
			clearCart();
		}
	});
}

// ==========================================
//   经理功能 (Manager) - 保持原样
// ==========================================

function viewBookedTickets(){
	resetManager();
	$('#manager-dynamic-1').html('<input id="datepicker-manager-1" placeholder="选择查看日期">');
	$('#datepicker-manager-1').pickadate({
				formatSubmit: 'yyyy-mm-dd', 
 				hiddenName: true,
 				onSet: function( event ) {
 					if ( event.select ) {
 						$('#datepicker-manager-1').prop('disabled', true);
 						getShowsShowingOnDate_Mgr(this.get('select', 'yyyy-mm-dd' ));
 					}
 				}
	});
}
function getShowsShowingOnDate_Mgr(mdate){
	date = mdate;
	$.ajax({
		type: 'POST',
		url: '/getShowsShowingOnDate',
		data: {'date' : date},
		success: function(response){
			$('#manager-dynamic-2').html(response);
		}
	});
}
function selectShow(mshowID){
	showID = mshowID;
	$.ajax({
		type: 'POST',
		url: '/getBookedWithShowID',
		data: {'showID' : showID},
		success: function(response){
			$('#manager-dynamic-2 button').prop('disabled', true)
			$('#manager-dynamic-3').html(response);
		}
	});
}
function insertMovie(){
	resetManager();
	$.ajax({
		type: 'GET',
		url: '/fetchMovieInsertForm',
		success: function(response){
			$('#manager-dynamic-1').html(response);
			$('#datepicker-manager-2').pickadate({
				formatSubmit: 'yyyy-mm-dd', hiddenName: true,
 				onSet: function( event ) { if ( event.select ) startShowing = this.get('select', 'yyyy-mm-dd' ); }
			});
			$('#datepicker-manager-3').pickadate({
				formatSubmit: 'yyyy-mm-dd', hiddenName: true,
 				onSet: function( event ) { if ( event.select ) endShowing = this.get('select', 'yyyy-mm-dd' ); }
			});
		}
	});
}
function filledMovieForm(){
	var availTypes = $('[name="movieTypes"]')[0].value.trim();
	var movieName = $('[name="movieName"]')[0].value;
	var movieLang = $('[name="movieLang"]')[0].value;
	var movieLen = $('[name="movieLen"]')[0].value;
	
	if($('#datepicker-manager-2')[0].value == '' || $('#datepicker-manager-3')[0].value == '' ||
	movieName == '' || movieLang == '' || movieLen == '' || availTypes == '')
		$('#manager-dynamic-2').html('<h5>请填写所有信息</h5>');
	else if(! $.isNumeric(movieLen))
		$('#manager-dynamic-2').html('<h5>电影时长必须为数字（分钟）</h5>');
	else if(Date.parse(startShowing) > Date.parse(endShowing))
		$('#manager-dynamic-2').html("<h5>首映日期必须早于下映日期</h5>");
	else{
		movieLen = parseInt(movieLen, 10);
		$.ajax({
			type: 'POST',
			url: '/insertMovie',
			data: {
				'movieName' : movieName, 'movieLen' : movieLen, 'movieLang' : movieLang,
				'types' : availTypes, 'startShowing' : startShowing, 'endShowing' : endShowing
			},
			success: function(response){
				$('#manager-dynamic-2').html(response);
			}
		});
	}
}
function createShow(){
	resetManager();
	$('#manager-dynamic-1').html('<input id="datepicker-manager-3" placeholder="选择排片日期"><input id="timepicker-manager-1" placeholder="选择开场时间"><button onclick="getValidMovies()">查询</button>');
	$('#datepicker-manager-3').pickadate({
				formatSubmit: 'yyyy-mm-dd', hiddenName: true, min: new Date(),
 				onSet: function( event ) { if ( event.select ) showDate = this.get('select', 'yyyy-mm-dd' ); }
	});
	$('#timepicker-manager-1').pickatime({
				formatSubmit: 'HHi', hiddenName: true, interval: 15,
 				min: new Date(2000,1,1,8), max: new Date(2000,1,1,22),
 				onSet: function( event ) { if ( event.select ) showTime = parseInt(this.get('select', 'HHi' ), 10); }
	});
}
function getValidMovies(){
	if($('#timepicker-manager-1')[0].value == '' || $('#datepicker-manager-3')[0].value == ''){
		$('#manager-dynamic-2').html('<h5>请选择日期和时间</h5>');
		return;
	}
	$('#manager-dynamic-1 input,#manager-dynamic-1 button').prop('disabled', true)
	$.ajax({
			type: 'POST',
			url: '/getValidMovies',
			data: { 'showDate' : showDate },
			success: function(response){ $('#manager-dynamic-2').html(response); }
		});
}
function selectShowMovie(movID,types){
	movieID = movID;
	$('#manager-dynamic-2 button').prop('disabled', true);
	$('#manager-dynamic-3').html('<h4>选择放映制式</h4>');
	var projectionTypes = ['2D', '3D', '4DX'];
	projectionTypes.forEach(function(t){
		$('#manager-dynamic-3').append('<button onclick="selectShowType('+("'"+t+"'")+')">'+t+'</button>');
	});
}
function selectShowType(t){
	type = t;
	$.ajax({
			type: 'POST',
			url: '/getHallsAvailable',
			data: { 'showDate' : showDate, 'showTime' : showTime, 'movieID' : movieID },
			success: function(response){
				$('#manager-dynamic-3 button').prop('disabled', true);
				$('#manager-dynamic-4').html(response);
			}
		});
}
function selectShowHall(hall){
	$.ajax({
			type: 'POST',
			url: '/insertShow',
			data: { 'hallID' : hall, 'movieType' : type, 'showDate' : showDate, 'showTime' : showTime, 'movieID' : movieID },
			success: function(response){
				$('#manager-dynamic-4 button').prop('disabled', true);
				$('#manager-dynamic-5').html(response);
			}
		});
}
function alterPricing(){
	resetManager();
	$.ajax({
			type: 'GET',
			url: '/getPriceList',
			success: function(response){
				$('#manager-dynamic-1').html(response);
			}
		});
}
function alterPrice(mpriceID){
	priceID = mpriceID;
	$('#manager-dynamic-1 button').prop('disabled', true);
	$('#manager-dynamic-2').html('<input type="number" name="new_price" placeholder="输入新价格 (¥)"><button onclick="changePrice()">修改</button>');
}
function changePrice(){
	var newPrice = $('#manager-dynamic-2 input')[0].value;
	$.ajax({
			type: 'POST',
			url: '/setNewPrice',
			data: { 'priceID' : priceID, 'newPrice' : newPrice },
			success: function(response){
				$('#manager-dynamic-3').html(response);
			}
		});
}
function manageSnacks(){
	resetManager();
	$('#manager-dynamic-1').html(`
		<input id="snack-name" placeholder="小吃名称">
		<input id="snack-price" placeholder="价格" type="number">
		<button onclick="addSnack()">添加</button>
		<hr style="border-color:rgba(255,255,255,0.2);">
		<div id="manager-snack-list"></div>
	`);
	loadManagerSnacks();
}
function addSnack(){
	var name = $('#snack-name').val();
	var price = $('#snack-price').val();
	$.ajax({
		type: 'POST',
		url: '/insertSnack',
		data: {'name': name, 'price': price},
		success: function(resp){
			loadManagerSnacks();
			$('#snack-name').val('');
			$('#snack-price').val('');
		}
	});
}
function loadManagerSnacks(){
	$.ajax({
		type: 'GET',
		url: '/getSnacks',
		success: function(data){
			var html = '<ul style="list-style:none; padding-left:0; color:white;">';
			data.forEach(function(item){
				html += `<li>${item.name} - ¥${item.price}</li>`;
			});
			html += '</ul>';
			$('#manager-snack-list').html(html);
		}
	});
}
function resetManager(){
	$('#manager-dynamic-1').html('');
	$('#manager-dynamic-2').html('');
	$('#manager-dynamic-3').html('');
	$('#manager-dynamic-4').html('');
	$('#manager-dynamic-5').html('');
	$('#options button').prop('disabled', false);
}
