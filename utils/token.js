import Base from "./base";
const base = new Base();

class Token{
     getToken(){
        wx.login({
           success:async res=>{
            const data = await base.request("token/user",{code:res.code},"POST");
            // 将令牌保存本地
            wx.setStorageSync('token', data.token);    
          }
        })
       
    }
    async verifyToken(token){
        const res =await base.request("token/verify",{token},"POST");
        if(!res.isValid){
            // 令牌已过期或无效需要重新加载
            this.getToken();
        }
    }
}
export default  Token;