// 检查密码格式
// 不小于8位，包含数字和字母，不大于32位
export const validatePassword = (password: string) => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,32}$/;
  return reg.test(password);
};
