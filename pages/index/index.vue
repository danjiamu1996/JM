<template>
	<view class="container">
		<view class="load-w" v-if="loading">
			<image src="../../static/Loading.png" class="loading" />
			<view class="load-text">努力加载中...</view>
		</view>
		<form @submit="onSubmit" v-if="isShowWX && !loading">
			<view class="form-item">
				<text>消费类目：</text>
				<input v-model="form.name" placeholder="请输入消费类目" />
			</view>

			<view class="form-item">
				<text>消费金额：</text>
				<input v-model="form.amount" type="number" placeholder="请输入消费金额" />
			</view>
			<button type="button" @click="onSubmit">提交</button>
		</form>
		<form @submit="onSubmit" v-if="!isShowWX && !loading">
			<view class="form-item">
				<text>姓名：</text>
				<input v-model="form.name" placeholder="请输入姓名" />
			</view>

			<view class="form-item">
				<text>电话：</text>
				<input v-model="form.phone" type="number" placeholder="请输入电话" />
			</view>

			<view class="form-item">
				<text>所在地区：</text>
				<view class="input selectcity" @tap="open">
					<input placeholder="请选择省市区" disabled type="text" v-model="form.address" />
				</view>
				<cityPicker :column="column" :default-value="defaultValue" :mask-close-able="maskCloseAble"
					@confirm="confirm" @cancel="cancel" :visible="visible" />
			</view>

			<view class="form-item">
				<text>详细地址：</text>
				<input v-model="form.detailAddress" placeholder="请输入详细地址" />
			</view>

			<view class="form-item">
				<text>金额：</text>
				<input v-model="form.amount" type="number" placeholder="请输入付款金额" />
			</view>

			<view class="form-item">
				<text>备注：</text>
				<input v-model="form.remark" placeholder="请输入备注" />
			</view>

			<button type="button" @click="onSubmit">提交</button>
		</form>
	</view>
</template>

<script>
	import {
		post,
		get
	} from '../../utils/request'; // 引入封装好的请求函数
	import {
		addressData
	} from '../../utils/map.js'; // 导入地址数据
	import cityPicker from '../../uni_modules/piaoyi-cityPicker/components/piaoyi-cityPicker/piaoyi-cityPicker'

	export default {
		components: {
			cityPicker,
		},
		data() {
			return {
				form: {
					name: '',
					phone: '',
					address: '山西省运城市临猗县',
					detailAddress: '',
					remark: '',
					amount: null
				},
				visible: false,
				maskCloseAble: true,
				defaultValue: '140821',
				column: 3,
				isShowWX: true,
				loading: true
			};
		},
		methods: {
			// 提交表单
			async onSubmit(e) {
				e.preventDefault();
				if (this.isShowWX) {
					this.form.phone = '11122223333'
					this.form.detailAddress = 'true'
					this.form.remark = 'true'
				}

				const {
					name,
					phone,
					address,
					detailAddress,
					remark,
					amount
				} = this.form;

				// 去除手机号前后空格
				const trimmedPhone = phone.trim();

				// 检查每个字段是否为空
				if (!name) {
					uni.showToast({
						title: '姓名不能为空',
						icon: 'none'
					});
					return;
				}

				if (!trimmedPhone) {
					uni.showToast({
						title: '手机号不能为空',
						icon: 'none'
					});
					return;
				}

				// 验证手机号是否为11位数字
				const phonePattern = /^[0-9]{11}$/;
				if (!phonePattern.test(trimmedPhone)) {
					uni.showToast({
						title: '请输入有效的11位手机号',
						icon: 'none'
					});
					return;
				}

				if (!address) {
					uni.showToast({
						title: '所在地区不能为空',
						icon: 'none'
					});
					return;
				}

				if (!detailAddress) {
					uni.showToast({
						title: '详细地址不能为空',
						icon: 'none'
					});
					return;
				}

				if (!amount) {
					uni.showToast({
						title: '付款金额不能为空',
						icon: 'none'
					});
					return;
				}

				if (!remark) {
					uni.showToast({
						title: '备注不能为空',
						icon: 'none'
					});
					return;
				}

				try {
					const res = await post('/submit', {
						name,
						phone,
						address: `${address}${detailAddress}`,
						remark,
						amount
					});
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					// 提交成功，跳转到成功页面
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/submitSuccess/submitSuccess' // 跳转到提交成功页面
						});
					}, 1500)
				} catch (error) {
					uni.showToast({
						title: `网络请求失败`,
						icon: 'none'
					});
				}
			},

			open() {
				this.visible = true
			},
			confirm(val) {
				this.form.address = val.name
				this.visible = false
			},
			cancel() {
				this.visible = false
			},
		},

		async onLoad() {
			try {
				const res = await get('/ui-status');
				this.isShowWX = res.data.isUIEnabled
				if (this.isShowWX == false) {
					uni.setNavigationBarTitle({
						title: '收货信息填写'
					})
				}
				this.loading = false
			} catch (error) {
				this.isShowWX = true
				this.loading = false
			}
			setTimeout(() => {
				if (this.isShowWX == true) {
					this.loading = false
					this.isShowWX = true
				}
			}, 5000)
		},

		// 分享至微信好友
		onShareAppMessage: function() {
			return {
				title: '锯妹-填写订单', // 分享给朋友时显示的标题
				path: '/pages/index/index', // 分享的路径
				success: function(res) {
					console.log('分享成功:', res);
				},
				fail: function(res) {
					console.log('分享失败:', res);
				}
			};
		},

		// 分享至微信朋友圈
		onShareTimeline: function() {
			return {
				title: '锯妹-填写订单', // 朋友圈分享显示的标题
				path: '/pages/index/index',
				imageUrl: import('../../static/logo.png'), // 朋友圈分享时显示的图片
				success: function(res) {
					console.log('朋友圈分享成功:', res);
				},
				fail: function(res) {
					console.log('朋友圈分享失败:', res);
				}
			};
		}
	};
</script>

<style scoped>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	.container {
		padding: 40rpx;
	}

	.load-w {
		display: flex;
		flex-direction: column;
		position: fixed;
		left: calc(50vw - 60rpx);
		top: 26vh;
	}

	.loading {
		width: 120rpx;
		height: 120rpx;
		animation: spin 2s linear infinite;
	}

	.load-text {
		font-size: 30rpx;
		color: #333;
		margin-top: 20rpx;
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	button {
		background-color: #63b166;
		color: white;
		padding: 20rpx;
		border-radius: 10rpx;
	}

	.picker-btn {
		padding: 20rpx;
		border: 2rpx solid #ccc;
		border-radius: 10rpx;
		text-align: center;
		color: #333;
	}
</style>