// app.js
import Token from "./utils/token";
const token = new Token();
App({
    onLaunch(){
        // 尝试获取令牌
        const tokenStr=wx.getStorageSync('token');
        if(tokenStr){
            // 验证令牌改令牌是否有效
            const tokenStr=wx.getStorageSync('token');
            if(tokenStr){
                token.verifyToken(tokenStr);
            }
        }else{
            // 登陆小程序获取身份令牌
            token.getToken();
        }
        
    }
})
