// pages/cate/cate.js
import Base from "../../utils/base";
const base = new Base();
// 声明全局变量来记录已经请求过的分类数据
const localData = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    curIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取左侧数据
    await this.getAllCategory();
    // 获取右侧数据
    this.getRightData(0);
  },
  //获取所有分类数据
  async getAllCategory() {
    const cateData = await base.request("category/all");
    this.setData({
      cateData,
    });
  },
  //获取某一分类下的商品数据
  async getProductsById(id) {
    const products = await base.request("product/by_category", { id });
    return products;
  },
  //组装右侧数据
  async getRightData(index) {
    // 先查看记录册是否有当前有当前分类数据
    if (localData[index]) {
      // 记录册有数据，直接返回即可
      this.setData(localData[index]);
      return;
    }
    // 记录册没有当前分类，需要去服务器重新加载
    // 获取当前分类
    const cate = this.data.cateData[index];
    const rightData = {
      headImg: cate.img.url,
      name: cate.name,
      products: await this.getProductsById(cate.id),
    };
    this.setData(rightData);
    // 把当前分类数据保存至记录册
    localData[index] = rightData;
  },

  onTab(e) {
    const index = e.mark.index;
    this.setData({
      curIndex: index,
    });
    this.getRightData(index);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
