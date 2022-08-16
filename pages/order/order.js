// pages/order/order.js
import Base from "../../utils/base";
import Address from "../../utils/address";
const base = new Base();
const address=new Address();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressInfo: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 如果是旧订单获取订单id
    const id=options.id;
    // 将id进行保存
    this.data.id=id;
    // 从服务器获取默认收货地址
    const addressInfo =await address.getAddress();
    console.log(addressInfo);
    this.setData({addressInfo})
    if(id){
        // 这个是旧订单-----去服务器加载旧订单详情
        // this.getOrderFromServer(id); 
    }else{
        // 获取订单数据
        this.getOrderData(); 
    }
  },

  onShow(){
    // 旧订单从服务拿数据
    // 需要支付结束后更新订单装态
    if(this.data.id){
        this.getOrderFromServer(this.data.id);    
    }
    
  },
  //  发起支付逻辑
  async toPay(id){
    const res= await base.request("pay/pre_order",{id:id||this.data.id},"POST");
    // res:包含一系列支付参数
    // 调起微信支付
    wx.requestPayment({
        nonceStr: res.nonceStr,
        package: res.package,
        paySign: res.paySign,
        timeStamp: res.timeStamp,
        success:(res)=>{
            // 支付成功后可以跳转展示支付结果页面
        }
    })
  },

  async  getOrderFromServer(id){
    const data =await base.request("order/"+id);
    console.log("旧订单数据",data);
    // 处理订单地址
    const addressInfo=data.snap_address; 
    this.setData({
        orderInfo:{
            createTime:data.create_time,
            orderNo:data.order_no,
            status:data.status,
            totalPrice:data.total_price,
        },
        orderData:data.snap_items,
        addressInfo:address._bindAddress(addressInfo)
    })
   
  },
  async onAddress() {
        const res = await wx.chooseAddress();
        console.log("收货地址", res);
        // 将当前选中的地址渲染到页面上
        const addressInfo= address._bindAddress(res);
        this.setData({addressInfo})
        // 将当前选中的地址上传至服务器
        base.request(
        "address",
        {
            name: res.userName,
            mobile: "13512345678",
            province: res.provinceName,
            city: res.cityName,
            country: res.countyName,
            detail: res.detailInfo,
        },
        "POST"
        );
    },
 
 

  // 去付款逻辑
  onPay() {
    // 若没有填写收货地址需要给提示
    if (!this.data.addressInfo) {
      this._showTips("下单提示", "请填写您的收货地址");
      return;
    }
    // 如果是第一次支付则先 生成订单再付款
    if (!this.data.id) {
        this.createOrder();
    } else {
        // 旧订单--直接支付即可
        this.toPay();
    }
  },

  // 封装函数显示弹窗
  _showTips(title, content) {
    wx.showModal({
      title,
      content,
      showCancel: false,
    });
  },

  async createOrder() {
    // 先组装往后台发送的数据
    const products = this.data.orderData.map((item) => {
      return {
        product_id: item.id,
        count: item.count,
      };
    });
    console.log(products);
    const res = await base.request("order", { products }, "POST");
    console.log("订单", res);
    if(res.pass){
        // 订单成功创建--发起支付
        const orderInfo= base.request("pay/pre_order",{id:res.order_id},"POST");
        console.log(orderInfo);
        // orderInfo包含支付参数
        wx.requestPayment({
          nonceStr: orderInfo.a,
          package: orderInfo.b,
          paySign: orderInfo.c,
          timeStamp: orderInfo.d,
        })
    }else{
        // 订单创建失败--提示用户
        this.orderFalse(res);
    }
  },
  // 订单失败处理方法
  orderFalse(res){
      console.log(res);
    // 1先拿到当前订单的商品
    const orderProducts=res.pStatusArray;
    // 2选择出缺货的商品
    const noStocks=orderProducts.filter(item=>{
        return !item.haveStock;
    })
    console.log(noStocks);
    // 3拿到缺货商品的名字
    const nameArr=noStocks.map(item=>{
        return item.name;
    })
    // 4提示文字:情况1：一件或件商品直接缺货
    // 2.多余两节商品缺货
    let tips="";
    if(nameArr.length<=2){
        tips=nameArr.join(",");
    }else{
        tips=nameArr[0]+","+nameArr[1]+"等";
    }
    tips+="缺货";
    this._showTips("下单失败",tips);
  },

  getOrderData() {
    // 拿到购物车所有数据
    const cartData = wx.getStorageSync("cart");
    // 价钱
    let money=0;
    // 筛选要买的商品
    const orderData = cartData.filter((item) => {
      return item.status;
    });
    orderData.forEach(item=>{
        money+=(item.price*100)*item.count;
    })
    // 把订单商品绑定到页面上
    this.setData({ orderData,money:money/100 });
  },


});
