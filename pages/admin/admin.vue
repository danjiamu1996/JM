<template>
	<view class="container">
		<!-- 页面密码验证 -->
		<view v-if="showPasswordDialog" class="password-dialog">
			<view class="password-box">
				<input v-model="inputPassword" type="password" placeholder="请输入密码" class="password-input" />
				<button class="confirm-btn" @click="validatePassword">确认</button>
			</view>
		</view>

		<!-- 页面内容 -->
		<view v-if="!showPasswordDialog">
			<!-- 遍历按日期分组的订单 -->
			<view v-for="(item, index) in submissions" :key="index" class="date-section">
				<view class="date-header">
					<text class="date-title">{{ item.date }}</text>
					<button class="copy-all" @click="copyAllOrders(item.list)">复制该日期所有订单信息</button>
				</view>

				<!-- 遍历当前日期的所有订单 -->
				<view v-for="(order, i) in item.list" :key="order._id" class="order-item">
					<view class="order-update" v-if="order.isUpdated">
						已更新
					</view>
					<view class="order-details">
						<text>姓名：{{ order.name }}</text>
						<text>电话：{{ order.phone }}</text>
						<text>地址：{{ order.address }}</text>
						<text>备注：{{ order.remark }}</text>
					</view>
					<view class="order-actions">
						<button class="copy-order" @click="copyOrder(order)">复制</button>
						<button class="delete-order" @click="confirmDeleteOrder(order._id, index)">删除</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		get,
		del
	} from '../../utils/request'; // 引入封装好的请求函数

	export default {
		data() {
			return {
				// 从后端接口返回的按日期分组的订单
				submissions: [],
				inputPassword: '', // 存储输入的密码
				correctPassword: '1234', // 假设密码是1234
				showPasswordDialog: false, // 控制密码输入框的显示
			};
		},

		onLoad() {
			this.checkPassword();
		},

		methods: {
			// 检查是否需要输入密码
			checkPassword() {
				const today = new Date().toLocaleDateString();
				const storedDate = uni.getStorageSync('passwordDate');
				if (storedDate === today) {
					// 今天已经输入过密码，不需要再输入
					this.fetchSubmissions();
				} else {
					// 显示密码输入框
					this.showPasswordDialog = true;
				}
			},

			// 验证密码
			validatePassword() {
				if (this.inputPassword === this.correctPassword) {
					// 密码验证成功
					uni.setStorageSync('passwordDate', new Date().toLocaleDateString()); // 存储今天日期
					this.showPasswordDialog = false; // 隐藏密码输入框
					this.fetchSubmissions(); // 加载订单数据
				} else {
					uni.showToast({
						title: '密码错误',
						icon: 'none',
					});
				}
			},

			// 获取订单信息
			async fetchSubmissions() {
				try {
					const res = await get('/submissions');
					// 格式化日期
					this.submissions = res.data.submissions.map(item => {
						item.date = this.formatDate(item.date); // 格式化日期
						return item;
					})
				} catch (error) {
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				}
			},

			// 格式化日期为 今天 / 昨天 / 日期
			formatDate(date) {
				const today = new Date();
				const targetDate = new Date(date);

				// 获取今天和目标日期的时间戳
				const todayTimestamp = today.setHours(0, 0, 0, 0); // 设置为当天0点
				const targetDateTimestamp = targetDate.setHours(0, 0, 0, 0);

				const diffDays = (todayTimestamp - targetDateTimestamp) / (1000 * 3600 * 24); // 计算日期差

				if (diffDays === 0) {
					return '今天'; // 今天
				} else if (diffDays === 1) {
					return '昨天'; // 昨天
				} else {
					// 显示具体日期
					const year = targetDate.getFullYear();
					const month = targetDate.getMonth() + 1;
					const day = targetDate.getDate();
					return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`; // 格式化日期为 YYYY-MM-DD
				}
			},

			// 弹出二次确认删除框
			confirmDeleteOrder(orderId, index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个订单吗？',
					success: (res) => {
						if (res.confirm) {
							this.deleteOrder(orderId, index); // 如果用户确认，删除订单
						}
					}
				});
			},

			// 删除订单
			async deleteOrder(orderId, index) {
				try {
					const response = await del(`/delete-order/${orderId}`);
					if (response.code == 200) {
						uni.showToast({
							title: response.message,
							icon: 'success'
						});
						// 删除订单后更新界面
						this.removeOrderFromUI(orderId, index);
					} else {
						uni.showToast({
							title: response.message,
							icon: 'error'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '网络不佳',
						icon: 'error'
					});
				}
			},

			// 从本地界面中移除已删除的订单
			removeOrderFromUI(orderId) {
				// 遍历日期组，找到对应日期并删除指定订单
				this.submissions.forEach((dateGroup) => {
					dateGroup.list = dateGroup.list.filter(order => order._id !== orderId);
					// 如果该日期没有订单了，删除该日期组
					if (dateGroup.list.length === 0) {
						// 删除这个日期组
						const index = this.submissions.indexOf(dateGroup);
						if (index > -1) {
							this.submissions.splice(index, 1);
						}
					}
				});
			},


			// 复制当前日期所有订单的信息
			copyAllOrders(list) {
				const orderText = list.map(order => {
					return `姓名：${order.name}\n电话：${order.phone}\n地址：${order.address}\n备注：${order.remark}\n`;
				}).join('\n');
				this.copyToClipboard(orderText);
			},

			// 复制单个订单信息
			copyOrder(order) {
				const orderText =
					`姓名：${order.name}\n电话：${order.phone}\n地址：${order.address}\n备注：${order.remark}\n`;
				this.copyToClipboard(orderText);
			},

			// 复制到剪贴板的通用方法
			copyToClipboard(text) {
				uni.setClipboardData({
					data: text,
					success() {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						});
					},
					fail() {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			}
		},
		// 分享至微信好友
		onShareAppMessage: function() {
			return {
				title: '锯妹-订单管理', // 分享给朋友时显示的标题
				path: '/pages/admin/admin', // 分享的路径
				success: function(res) {
					console.log('分享成功:', res);
				},
				fail: function(res) {
					console.log('分享失败:', res);
				}
			};
		},
	};
</script>

<style scoped>
	button {
		padding: 0 24rpx !important;
	}

	.container {
		padding: 40rpx;
		background-color: #FFFFFF;
	}

	.date-section {
		margin-bottom: 60rpx;
	}

	.date-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.date-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	.copy-all {
		background-color: #63b166;
		color: white;
		padding: 16rpx 32rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		cursor: pointer;
	}

	.copy-order,
	.delete-order {
		background-color: #888;
		color: white;
		padding: 12rpx 24rpx;
		font-size: 24rpx;
		border-radius: 10rpx;
		cursor: pointer;
	}

	.delete-order {
		background-color: #FF6F61;
	}

	.order-item {
		position: relative;
		padding: 40rpx;
		background-color: #F7F7F7;
		border-radius: 16rpx;
		box-shadow: 0px 4rpx 10rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}

	.order-update {
		position: absolute;
		right: 20rpx;
		top: 16rpx;
		background: #c2bc0a;
		color: #fff;
		padding: 6rpx 10rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
	}

	.order-details {
		margin-bottom: 20rpx;
	}

	.order-details text {
		display: block;
		margin-bottom: 10rpx;
		color: #555555;
	}

	.order-actions {
		margin-top: 20rpx;
		display: flex;
		justify-content: flex-end;
	}

	button {
		border: none;
		outline: none;
	}

	.password-dialog {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.password-box {
		background-color: #ffffff;
		padding: 60rpx;
		border-radius: 16rpx;
		box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.2);
		text-align: center;
		width: 80%;
		max-width: 600rpx;
	}

	.password-input {
		width: 92%;
		padding: 20rpx;
		margin-bottom: 40rpx;
		font-size: 36rpx;
		border: 2rpx solid #ccc;
		border-radius: 10rpx;
	}

	.confirm-btn {
		width: 100%;
		padding: 20rpx;
		background-color: #63b166;
		color: white;
		border: none;
		border-radius: 10rpx;
		font-size: 32rpx;
		cursor: pointer;
	}

	.confirm-btn:hover {
		background-color: #4a9c4e;
	}
</style>