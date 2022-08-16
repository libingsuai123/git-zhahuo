import Base from "../utils/base";
const base =new Base();

export default class Address{
    // 从服务器获取地址
    async getAddress() {
        const res = await base.request("address");
        console.log("数据库的收货地址", res);
        // 将获取到的收货地址绑定到页面上
        return this._bindAddress(res);
    }
    // 将收货地址绑定到页面上
    _bindAddress(res) {
        // 拼接详细地址
        const province = res.provinceName || res.province,
        city = res.cityName || res.city,
        country = res.countyName || res.country,
        detail = res.detailInfo || res.detail;
        // 先拼接市县街道
        let str = city + country + detail;
        // 再根据当前省是否是直辖市来决定要不要拼接省份
        if (!this.isCenterCity(province)) {
        str = province + str;
        }
        const addressInfo = {
        userName: res.userName || res.name,
        mobile: res.telNumber || res.mobile,
        detailAddress: str,
        };
        return addressInfo;
    }
      // 封装方法判断当前省份是否是直辖市
    isCenterCity(name) {
        const centerCity = ["北京市", "上海市", "重庆市", "天津市"];
        return centerCity.includes(name);
    }

      //添加用户收货地址
    async onAddress(res) {
        // 将当前选中的地址渲染到页面上
        const addressInfo= this._bindAddress(res);
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
    }
}

