# 校园活动管理系统页面结构

## 1. 基础页面
- /app/page.tsx (首页/活动列表：展示活动列表，支持简单分页，活动卡片展示基本信息，登录/注册入口)
- /app/login/page.tsx (登录页：邮箱/密码登录表单，注册入口)
- /app/register/page.tsx (注册页：用户注册表单，用户角色选择，登录入口)

## 2. 活动相关页面
- /app/activities/[id]/page.tsx (活动详情页：活动详细信息展示，报名按钮/报名状态，组织者信息)
- /app/activities/create/page.tsx (活动创建页：活动信息表单，包含基本信息、时间地点设置、报名人数限制)
- /app/activities/edit/[id]/page.tsx (活动编辑页：与创建页面结构相同，预填充现有活动信息)

## 3. 用户中心页面
- /app/profile/page.tsx (个人信息页：基本信息展示与编辑，密码修改)
- /app/profile/activities/page.tsx (我的活动页：已创建的活动列表，活动状态管理，报名审核)
- /app/profile/registrations/page.tsx (我的报名页：已报名活动列表，报名状态查看，取消报名功能)

## 4. 通用组件
### 4.1 导航栏
- Logo
- 主导航菜单
- 用户菜单

### 4.2 页脚
- 基础分隔线
