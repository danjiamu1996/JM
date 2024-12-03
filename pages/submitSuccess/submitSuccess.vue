<template>
	<view class="container">
		<view class="icon-container">
			<icon type="success" size="100" color="#4CAF50"></icon>
		</view>
		<view class="message">
			<text>提交成功</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {};
		},
		onLoad() {
			// 可以在此处添加其他逻辑，如计时跳转等
		}
	};
</script>

<style scoped>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		flex-direction: column;
	}

	.icon-container {
		margin-bottom: 20px;
	}

	.message {
		font-size: 24px;
		color: #4CAF50;
		font-weight: bold;
	}
</style>