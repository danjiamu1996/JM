"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  data() {
    return {
      isShowWX: true,
      // 从后端接口返回的按日期分组的订单
      submissions: [],
      currentPage: 1,
      // 当前页码
      inputPassword: "",
      // 存储输入的密码
      correctPassword: "1234566",
      // 假设密码是1234
      showPasswordDialog: false,
      // 控制密码输入框的显示
      editDialogVisible: false,
      // 控制编辑弹框显示
      editedOrder: {
        name: "",
        phone: "",
        address: "",
        amount: "",
        remark: ""
      },
      index: 0,
      i: 0,
      status: 1
      // 1加载更多 2加载中 3暂无更多数据
    };
  },
  async onShow() {
    if (this.isShowWX == true) {
      try {
        const res = await utils_request.get("/ui-status");
        this.isShowWX = res.data.isUIEnabled;
        if (this.isShowWX == false) {
          common_vendor.index.setNavigationBarTitle({
            title: "发货信息统计"
          });
        }
      } catch (error) {
        this.isShowWX = true;
      }
    }
    this.checkPassword();
  },
  methods: {
    // 显示编辑对话框
    editOrder(order, index, i) {
      this.index = index;
      this.i = i;
      this.editedOrder = {
        ...order
      };
      this.editDialogVisible = true;
    },
    // 提交编辑
    async submitEdit() {
      try {
        const response = await utils_request.put(`/update-order/${this.editedOrder._id}`, this.editedOrder);
        if (response.code == 200) {
          common_vendor.index.showToast({
            title: "修改成功",
            icon: "success"
          });
          Object.assign(this.submissions[this.index].list[this.i], this.editedOrder);
          this.editDialogVisible = false;
        } else {
          common_vendor.index.showToast({
            title: response.message,
            icon: "none"
          });
        }
      } catch {
        common_vendor.index.showToast({
          title: "网络不佳",
          icon: "none"
        });
      }
    },
    // 关闭编辑弹框
    closeEditDialog() {
      this.editDialogVisible = false;
    },
    // 检查是否需要输入密码
    checkPassword() {
      const today = (/* @__PURE__ */ new Date()).toLocaleDateString();
      const storedDate = common_vendor.index.getStorageSync("passwordDate");
      if (storedDate === today) {
        this.fetchSubmissions();
      } else {
        this.showPasswordDialog = true;
      }
    },
    // 验证密码
    validatePassword() {
      if (this.inputPassword === this.correctPassword) {
        common_vendor.index.setStorageSync("passwordDate", (/* @__PURE__ */ new Date()).toLocaleDateString());
        this.showPasswordDialog = false;
        this.fetchSubmissions();
      } else {
        common_vendor.index.showToast({
          title: "密码错误",
          icon: "none"
        });
      }
    },
    // 获取订单信息
    async fetchSubmissions(page = 1) {
      if (this.status == 2 || this.status == 3)
        return;
      this.status = 2;
      try {
        const res = await utils_request.get("/submissions", {
          page,
          limit: 10
        });
        if (this.currentPage == res.data.totalPages) {
          this.status = 3;
        } else {
          this.status = 1;
        }
        const formattedData = res.data.submissions.map((item) => ({
          ...item,
          date: this.formatDate(item.date)
        }));
        this.submissions = page === 1 ? formattedData : [...this.submissions, ...formattedData];
      } catch (error) {
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      }
    },
    async loadMoreData() {
      if (this.status == 3)
        return;
      this.currentPage++;
      await this.fetchSubmissions(this.currentPage);
    },
    // 格式化日期为 今天 / 昨天 / 日期
    formatDate(date) {
      const today = /* @__PURE__ */ new Date();
      const targetDate = new Date(date);
      const todayTimestamp = today.setHours(0, 0, 0, 0);
      const targetDateTimestamp = targetDate.setHours(0, 0, 0, 0);
      const diffDays = (todayTimestamp - targetDateTimestamp) / (1e3 * 3600 * 24);
      if (diffDays === 0) {
        return "今天";
      } else if (diffDays === 1) {
        return "昨天";
      } else {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;
        const day = targetDate.getDate();
        return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
      }
    },
    // 弹出二次确认删除框
    confirmDeleteOrder(orderId, index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.deleteOrder(orderId, index);
          }
        }
      });
    },
    // 删除订单
    async deleteOrder(orderId, index) {
      try {
        const response = await utils_request.del(`/delete-order/${orderId}`);
        if (response.code == 200) {
          common_vendor.index.showToast({
            title: response.message,
            icon: "success"
          });
          this.removeOrderFromUI(orderId, index);
        } else {
          common_vendor.index.showToast({
            title: response.message,
            icon: "error"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络不佳",
          icon: "error"
        });
      }
    },
    // 从本地界面中移除已删除的订单
    removeOrderFromUI(orderId) {
      this.submissions.forEach((dateGroup) => {
        dateGroup.list = dateGroup.list.filter((order) => order._id !== orderId);
        if (dateGroup.list.length === 0) {
          const index = this.submissions.indexOf(dateGroup);
          if (index > -1) {
            this.submissions.splice(index, 1);
          }
        }
      });
    },
    // 复制当前日期所有订单的信息
    copyAllOrders(item, index) {
      var _a;
      let newList;
      if (item.date == ((_a = this.submissions[index + 1]) == null ? void 0 : _a.date)) {
        newList = [...item.list, ...this.submissions[index + 1].list];
      } else {
        newList = [...item.list];
      }
      const orderText = newList.map((order) => {
        return `姓名：${order.name}
电话：${order.phone}
地址：${order.address}
金额：${order.amount}
备注：${order.remark}
`;
      }).join("\n");
      this.copyToClipboard(orderText);
    },
    // 复制单个订单信息
    copyOrder(order) {
      const orderText = `姓名：${order.name}
电话：${order.phone}
地址：${order.address}
金额：${order.amount}
备注：${order.remark}
`;
      this.copyToClipboard(orderText);
    },
    // 复制到剪贴板的通用方法
    copyToClipboard(text) {
      common_vendor.index.setClipboardData({
        data: text,
        success() {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "success"
          });
        },
        fail() {
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        }
      });
    }
  },
  // 分享至微信好友
  onShareAppMessage: function() {
    return {
      title: "锯妹-订单管理",
      // 分享给朋友时显示的标题
      path: "/pages/admin/admin",
      // 分享的路径
      success: function(res) {
        console.log("分享成功:", res);
      },
      fail: function(res) {
        console.log("分享失败:", res);
      }
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showPasswordDialog
  }, $data.showPasswordDialog ? {
    b: $data.inputPassword,
    c: common_vendor.o(($event) => $data.inputPassword = $event.detail.value),
    d: common_vendor.o((...args) => $options.validatePassword && $options.validatePassword(...args))
  } : {}, {
    e: !$data.showPasswordDialog
  }, !$data.showPasswordDialog ? {
    f: common_vendor.f($data.submissions, (item, index, i0) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: item.date != ((_a = $data.submissions[index - 1]) == null ? void 0 : _a.date)
      }, item.date != ((_b = $data.submissions[index - 1]) == null ? void 0 : _b.date) ? {
        b: common_vendor.t(item.date)
      } : {}, {
        c: item.date != ((_c = $data.submissions[index - 1]) == null ? void 0 : _c.date) && !$data.isShowWX
      }, item.date != ((_d = $data.submissions[index - 1]) == null ? void 0 : _d.date) && !$data.isShowWX ? {
        d: common_vendor.o(($event) => $options.copyAllOrders(item, index), index)
      } : {}, {
        e: common_vendor.f(item.list, (order, i, i1) => {
          return common_vendor.e({
            a: order.isUpdated
          }, order.isUpdated ? {} : {}, !$data.isShowWX ? {
            b: common_vendor.t(order.name),
            c: common_vendor.t(order.phone),
            d: common_vendor.t(order.address),
            e: common_vendor.t(order.amount),
            f: common_vendor.t(order.remark)
          } : {}, $data.isShowWX ? {
            g: common_vendor.t(order.name),
            h: common_vendor.t(order.amount)
          } : {}, !$data.isShowWX ? {
            i: common_vendor.o(($event) => $options.copyOrder(order), order._id),
            j: common_vendor.o(($event) => $options.editOrder(order, index, i), order._id),
            k: common_vendor.o(($event) => $options.confirmDeleteOrder(order._id, index), order._id)
          } : {}, {
            l: order._id
          });
        }),
        f: index
      });
    }),
    g: !$data.isShowWX,
    h: $data.isShowWX,
    i: !$data.isShowWX
  } : {}, {
    j: $data.editDialogVisible
  }, $data.editDialogVisible ? {
    k: $data.editedOrder.name,
    l: common_vendor.o(($event) => $data.editedOrder.name = $event.detail.value),
    m: $data.editedOrder.phone,
    n: common_vendor.o(($event) => $data.editedOrder.phone = $event.detail.value),
    o: $data.editedOrder.address,
    p: common_vendor.o(($event) => $data.editedOrder.address = $event.detail.value),
    q: $data.editedOrder.amount,
    r: common_vendor.o(($event) => $data.editedOrder.amount = $event.detail.value),
    s: $data.editedOrder.remark,
    t: common_vendor.o(($event) => $data.editedOrder.remark = $event.detail.value),
    v: common_vendor.o((...args) => $options.closeEditDialog && $options.closeEditDialog(...args)),
    w: common_vendor.o((...args) => $options.submitEdit && $options.submitEdit(...args))
  } : {}, {
    x: !$data.showPasswordDialog && $data.submissions.length > 0
  }, !$data.showPasswordDialog && $data.submissions.length > 0 ? {
    y: common_vendor.t(["", "上滑加载更多", "加载中...", "暂无更多数据"][$data.status])
  } : {}, {
    z: common_vendor.o((...args) => $options.loadMoreData && $options.loadMoreData(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dbc77958"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
