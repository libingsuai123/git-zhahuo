// pages/my/my.js
import Base from "../../utils/base";
const base = new Base();
import Address from "../../utils/address";
const address=new Address();
Page({
    data:{
        orderData:[],//用来保存订单商品
    },
    async onLoad(){
        // 获取所有订单
        this.getAllorder();
        // 重服务器获取默认地址
        const addressInfo= await address.getAddress();
        this.setData({addressInfo});
    },
    async getUserInfo(){
        const res=await wx.getUserProfile({
          desc: '获取用户昵称和头像',
        })
        console.log("用户信息",res);
        this.setData({
            avatarUrl:res.userInfo.avatarUrl,
            nickName:res.userInfo.nickName,
        })
  
    },
    async getAllorder(){
        const res=await base.request("order/by_user",{page:1});
        console.log(res);
        this.setData({
            orderData:res.data
        })
    },
    async onChoose(){
        const res=await wx.chooseAddress();
        this.setData({
            addressInfo:address._bindAddress(res),
        })
        address.onAddress(res);
    },
    // 跳转订单详情
    toOrder(e){
        const id=e.mark.id;
        wx.navigateTo({
            url:"/pages/order/order?id="+id,
        })
    }
})