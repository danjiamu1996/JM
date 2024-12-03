"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const cityPicker = () => "../../uni_modules/piaoyi-cityPicker/components/piaoyi-cityPicker/piaoyi-cityPicker.js";
const _sfc_main = {
  components: {
    cityPicker
  },
  data() {
    return {
      form: {
        name: "",
        phone: "",
        address: "山西省运城市临猗县",
        detailAddress: "",
        remark: ""
      },
      visible: false,
      maskCloseAble: true,
      defaultValue: "140821",
      column: 3
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
      const trimmedPhone = phone.trim();
      if (!name) {
        common_vendor.index.showToast({
          title: "姓名不能为空",
          icon: "none"
        });
        return;
      }
      if (!trimmedPhone) {
        common_vendor.index.showToast({
          title: "手机号不能为空",
          icon: "none"
        });
        return;
      }
      const phonePattern = /^[0-9]{11}$/;
      if (!phonePattern.test(trimmedPhone)) {
        common_vendor.index.showToast({
          title: "请输入有效的11位手机号",
          icon: "none"
        });
        return;
      }
      if (!address) {
        common_vendor.index.showToast({
          title: "所在地区不能为空",
          icon: "none"
        });
        return;
      }
      if (!detailAddress) {
        common_vendor.index.showToast({
          title: "详细地址不能为空",
          icon: "none"
        });
        return;
      }
      if (!remark) {
        common_vendor.index.showToast({
          title: "备注不能为空",
          icon: "none"
        });
        return;
      }
      try {
        const res = await utils_request.post("/submit", {
          name,
          phone,
          address: `${address}${detailAddress}`,
          remark
        });
        common_vendor.index.showToast({
          title: "提交成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/submitSuccess/submitSuccess"
            // 跳转到提交成功页面
          });
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: `${address}${detailAddress}`,
          icon: "none"
        });
      }
    },
    open() {
      this.visible = true;
    },
    confirm(val) {
      this.form.address = val.name;
      this.visible = false;
    },
    cancel() {
      this.visible = false;
    }
  },
  // 分享至微信好友
  onShareAppMessage: function() {
    return {
      title: "锯妹-填写订单",
      // 分享给朋友时显示的标题
      path: "/pages/index/index",
      // 分享的路径
      success: function(res) {
        console.log("分享成功:", res);
      },
      fail: function(res) {
        console.log("分享失败:", res);
      }
    };
  },
  // 分享至微信朋友圈
  onShareTimeline: function() {
    return {
      title: "锯妹-填写订单",
      // 朋友圈分享显示的标题
      path: "/pages/index/index",
      imageUrl: Promise.resolve(require("../../static/logo.js")),
      // 朋友圈分享时显示的图片
      success: function(res) {
        console.log("朋友圈分享成功:", res);
      },
      fail: function(res) {
        console.log("朋友圈分享失败:", res);
      }
    };
  }
};
if (!Array) {
  const _component_cityPicker = common_vendor.resolveComponent("cityPicker");
  _component_cityPicker();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.name,
    b: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    c: $data.form.phone,
    d: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    e: $data.form.address,
    f: common_vendor.o(($event) => $data.form.address = $event.detail.value),
    g: common_vendor.o((...args) => $options.open && $options.open(...args)),
    h: common_vendor.o($options.confirm),
    i: common_vendor.o($options.cancel),
    j: common_vendor.p({
      column: $data.column,
      ["default-value"]: $data.defaultValue,
      ["mask-close-able"]: $data.maskCloseAble,
      visible: $data.visible
    }),
    k: $data.form.detailAddress,
    l: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    m: $data.form.remark,
    n: common_vendor.o(($event) => $data.form.remark = $event.detail.value),
    o: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args)),
    p: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
