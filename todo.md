# 活动管理系统功能清单

## 1. 用户管理模块 (auth.ts)
- [x] 用户注册
  - [x] 邮箱注册 `register(email, password, name, role)`
  - [x] 密码加密存储 `generatePasswordHash(password)`
  - [x] 密码验证 `verifyPassword(plainPassword, storedHash)`
- [x] 用户登录
  - [x] 邮箱登录 `login(email, password)`
  - [x] JWT token 生成与验证 `validateToken(token)`
  - [x] 登录状态检查 `checkPermission(userId, action)`
- [x] 用户信息管理
  - [x] 修改密码 `changePassword(userId, oldPassword, newPassword)`
  - [x] 更新个人信息 `updateUserProfile(userId, profile)`
  - [x] 查询用户信息 `getUserById(id)`
- [x] 管理员功能
  - [x] 用户列表查询 `listUsers(filters, pagination)`
  - [x] 用户状态管理 `setUserStatus(userId, status)`
  - [x] 用户角色设置 `setUserRole(userId, role)`

## 2. 活动基础功能 (activity.ts)
- [x] 活动创建
  - [x] 创建活动 `createActivity(organizerId, activityData)`
  - [x] 更新活动 `updateActivity(activityId, activityData)`
  - [x] 删除活动 `deleteActivity(activityId)`
- [x] 活动查询
  - [x] 获取单个活动 `getActivity(activityId)`
  - [x] 活动列表查询 `listActivities(filters, pagination)`
  - [x] 活动状态查询 `getActivityStatus(activityId)`
- [x] 活动状态管理
  - [x] 发布活动 `publishActivity(activityId)`
  - [x] 取消发布 `unpublishActivity(activityId)`
  - [x] 更新状态 `updateActivityStatus(activityId, status)`

## 3. 报名管理 (registration.ts)
- [x] 报名操作
  - [x] 创建报名 `registerActivity(userId, activityId)`
  - [x] 取消报名 `cancelRegistration(userId, activityId)`
  - [x] 查询报名状态 `getRegistrationStatus(userId, activityId)`
- [x] 报名管理
  - [x] 获取活动报名列表 `getActivityRegistrations(activityId)`
  - [x] 获取用户报名列表 `getUserRegistrations(userId)`
  - [x] 检查报名人数 `checkRegistrationCapacity(activityId)`
- [x] 报名审核
  - [x] 审核报名 `approveRegistration(registrationId)`
  - [x] 拒绝报名 `rejectRegistration(registrationId)`
  - [x] 批量审核 `bulkProcessRegistrations(registrationIds, action)`

## 4. 活动分类管理 (category.ts)
- [ ] 分类管理
  - [ ] 获取分类列表 `getCategories()`
  - [ ] 创建分类 `createCategory(categoryData)`
  - [ ] 更新分类 `updateCategory(categoryId, categoryData)`
- [ ] 分类关联
  - [ ] 获取分类活动 `getActivitiesByCategory(categoryId)`
  - [ ] 活动分类设置 `setActivityCategory(activityId, categoryId)`
  - [ ] 分类活动统计 `getCategoryStats(categoryId)`

## 5. 数据统计 (analytics.ts)
- [ ] 活动统计
  - [ ] 报名统计 `getRegistrationAnalytics(activityId)`
  - [ ] 参与情况统计 `getParticipationAnalytics(activityId)`
  - [ ] 活动状态统计 `getActivityStatusAnalytics()`
- [ ] 用户统计
  - [ ] 用户活动统计 `getUserActivityAnalytics(userId)`
  - [ ] 用户报名统计 `getUserRegistrationAnalytics(userId)`

## 6. 通知系统 (notification.ts)
- [ ] 系统通知
  - [ ] 创建通知 `createNotification(userId, activityId, message)`
  - [ ] 获取用户通知 `getUserNotifications(userId)`
  - [ ] 标记通知已读 `markNotificationAsRead(notificationId)`
- [ ] 邮件通知
  - [ ] 活动提醒 `sendActivityReminder(activityId)`
  - [ ] 报名确认 `sendRegistrationConfirmation(registrationId)`
  - [ ] 审核结果通知 `sendReviewNotification(registrationId)`
