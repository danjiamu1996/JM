<template>
	<view class="container">
		<form @submit="onSubmit">
			<view class="form-item">
				<text>姓名：</text>
				<input v-model="form.name" placeholder="请输入姓名" />
			</view>

			<view class="form-item">
				<text>电话：</text>
				<input v-model="form.phone" placeholder="请输入电话" />
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
	} from '../../utils/request'; // 引入封装好的请求函数
	import {
		addressData
	} from '../../utils/map.js'; // 导入地址数据
	import cityPicker from '../../uni_modules/piaoyi-cityPicker/components/piaoyi-cityPicker/piaoyi-cityPicker'

	export default {
		components: {
			cityPicker
		},
		data() {
			return {
				form: {
					name: '',
					phone: '',
					address: '山西省运城市临猗县',
					detailAddress: '',
					remark: ''
				},
				visible: false,
				maskCloseAble: true,
				defaultValue: '140821',
				column: 3,
			};
		},
		methods: {
			// 提交表单
			async onSubmit(e) {
				e.preventDefault();

				const {
					name,
					phone,
					address,
					detailAddress,
					remark
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
						remark
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
	.container {
		padding: 40rpx;
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	button {
		background-color: #007AFF;
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