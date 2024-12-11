"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const common_assets = require("../../common/assets.js");
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
        remark: "",
        amount: null
      },
      visible: false,
      maskCloseAble: true,
      defaultValue: "140821",
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
        this.form.phone = "11122223333";
        this.form.detailAddress = "true";
        this.form.remark = "true";
      }
      const {
        name,
        phone,
        address,
        detailAddress,
        remark,
        amount
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
      if (!amount) {
        common_vendor.index.showToast({
          title: "付款金额不能为空",
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
          remark,
          amount
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
          title: `网络请求失败`,
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
  async onLoad() {
    try {
      const res = await utils_request.get("/ui-status");
      this.isShowWX = res.data.isUIEnabled;
      if (this.isShowWX == false) {
        common_vendor.index.setNavigationBarTitle({
          title: "收货信息填写"
        });
      }
      this.loading = false;
    } catch (error) {
      this.isShowWX = true;
      this.loading = false;
    }
    setTimeout(() => {
      if (this.isShowWX == true) {
        this.loading = false;
        this.isShowWX = true;
      }
    }, 5e3);
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
      imageUrl: Promise.resolve(require("../../common/assets.js")).then((n) => n.logo),
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
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {
    b: common_assets._imports_0
  } : {}, {
    c: $data.isShowWX && !$data.loading
  }, $data.isShowWX && !$data.loading ? {
    d: $data.form.name,
    e: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    f: $data.form.amount,
    g: common_vendor.o(($event) => $data.form.amount = $event.detail.value),
    h: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args)),
    i: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args))
  } : {}, {
    j: !$data.isShowWX && !$data.loading
  }, !$data.isShowWX && !$data.loading ? {
    k: $data.form.name,
    l: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    m: $data.form.phone,
    n: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    o: $data.form.address,
    p: common_vendor.o(($event) => $data.form.address = $event.detail.value),
    q: common_vendor.o((...args) => $options.open && $options.open(...args)),
    r: common_vendor.o($options.confirm),
    s: common_vendor.o($options.cancel),
    t: common_vendor.p({
      column: $data.column,
      ["default-value"]: $data.defaultValue,
      ["mask-close-able"]: $data.maskCloseAble,
      visible: $data.visible
    }),
    v: $data.form.detailAddress,
    w: common_vendor.o(($event) => $data.form.detailAddress = $event.detail.value),
    x: $data.form.amount,
    y: common_vendor.o(($event) => $data.form.amount = $event.detail.value),
    z: $data.form.remark,
    A: common_vendor.o(($event) => $data.form.remark = $event.detail.value),
    B: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args)),
    C: common_vendor.o((...args) => $options.onSubmit && $options.onSubmit(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
