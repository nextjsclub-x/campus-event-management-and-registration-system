/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable default-case */
import db from '@/database/neon.db';
import { and, eq, sql, desc, asc } from 'drizzle-orm';
import { registrations } from '@/schema/registration.schema';
import { activities } from '@/schema/activity.schema';
import { users } from '@/schema/user.schema';

// 报名状态常量
export const RegistrationStatus = {
  CANCELLED: 0,    // 已取消
  PENDING: 1,      // 待审核（默认状态）
  APPROVED: 2,     // 已批准
  REJECTED: 3,     // 已拒绝
  WAITLIST: 4,     // 候补名单
  ATTENDED: 5,     // 已参加
  ABSENT: 6        // 未出席
} as const;

type RegistrationStatusType = typeof RegistrationStatus[keyof typeof RegistrationStatus];

// ====================
//  1. 创建报名
// ====================
export async function registerActivity(userId: number, activityId: number) {
  // 1. 检查活动是否存在且状态为已发布
  const [activity] = await db.select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.status, 2) // PUBLISHED 状态
      )
    );

  if (!activity) {
    throw new Error('Activity not found or not available for registration');
  }

  // 2. 检查是否已经报名过
  const [existingRegistration] = await db.select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.PENDING)
      )
    );

  if (existingRegistration) {
    throw new Error('You have already registered for this activity');
  }

  // 3. 检查活动容量
  const [{count}] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.APPROVED)
      )
    );

  const isWaitlist = activity.capacity > 0 && count >= activity.capacity;

  // 4. 创建报名记录
  const [registration] = await db.insert(registrations)
    .values({
      userId,
      activityId,
      status: isWaitlist ? RegistrationStatus.WAITLIST : RegistrationStatus.PENDING,
    })
    .returning({
      id: registrations.id,
      userId: registrations.userId,
      activityId: registrations.activityId,
      status: registrations.status,
      registeredAt: registrations.registeredAt
    });

  return {
    ...registration,
    statusText: isWaitlist ? 'On waitlist' : 'Pending approval'
  };
}

// ====================
//  2. 取消报名
// ====================
export async function cancelRegistration(userId: number, activityId: number) {
  // 1. 检查报名记录是否存在
  const [registration] = await db.select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.PENDING)
      )
    );

  if (!registration) {
    throw new Error('Registration not found or cannot be cancelled');
  }

  // 2. 更新报名状态为已取消
  const [updatedRegistration] = await db.update(registrations)
    .set({
      status: RegistrationStatus.CANCELLED
    })
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId)
      )
    )
    .returning({
      id: registrations.id,
      status: registrations.status,
      registeredAt: registrations.registeredAt
    });

  return {
    ...updatedRegistration,
    statusText: 'Cancelled'
  };
}

// ====================
//  3. 查询报名状态
// ====================
export async function getRegistrationStatus(userId: number, activityId: number) {
  // 1. 获取报名记录
  const [registration] = await db.select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId)
      )
    );

  if (!registration) {
    return {
      registered: false,
      status: null,
      statusText: 'Not registered'
    };
  }

  // 2. 获取状态文本描述
  let statusText: string;
  switch (registration.status) {
    case RegistrationStatus.CANCELLED:
      statusText = 'Cancelled';
      break;
    case RegistrationStatus.PENDING:
      statusText = 'Pending approval';
      break;
    case RegistrationStatus.APPROVED:
      statusText = 'Approved';
      break;
    case RegistrationStatus.REJECTED:
      statusText = 'Rejected';
      break;
    case RegistrationStatus.WAITLIST:
      statusText = 'On waitlist';
      break;
    case RegistrationStatus.ATTENDED:
      statusText = 'Attended';
      break;
    case RegistrationStatus.ABSENT:
      statusText = 'Absent';
      break;
    default:
      statusText = 'Unknown status';
  }

  return {
    registered: true,
    registrationId: registration.id,
    status: registration.status,
    statusText,
    registeredAt: registration.registeredAt
  };
}

// 在已有的 registration.model.ts 中添加以下函数

// 定义返回类型接口
interface RegistrationInfo {
    id: number;
    userId: number;
    activityId: number;
    status: number;
    registeredAt: Date;
    userName: string;    // 从 users 表关联
    activityTitle?: string; // 从 activities 表关联（用于用户报名列表）
  }
  
  interface CapacityInfo {
    activityId: number;
    capacity: number;
    approved: number;
    pending: number;
    waitlist: number;
    available: number;
    isFull: boolean;
  }
  
  // ====================
  //  4. 获取活动报名列表
  // ====================
  export async function getActivityRegistrations(
    activityId: number,
    options: {
      status?: RegistrationStatusType;
      page?: number;
      pageSize?: number;
      orderBy?: 'registeredAt' | 'status';
      order?: 'asc' | 'desc';
    } = {}
  ) {
    const {
      status,
      page = 1,
      pageSize = 20,
      orderBy = 'registeredAt',
      order = 'desc'
    } = options;
  
    // 1. 构建基础条件
    const conditions = [eq(registrations.activityId, activityId)];
    if (status !== undefined) {
      conditions.push(eq(registrations.status, status));
    }
  
    // 2. 构建基础查询
    const orderByColumn = orderBy === 'registeredAt' ? registrations.registeredAt : registrations.status;
    const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
    const offset = (page - 1) * pageSize;
    
    const query = db
      .select({
        id: registrations.id,
        userId: registrations.userId,
        activityId: registrations.activityId,
        status: registrations.status,
        registeredAt: registrations.registeredAt,
        userName: users.name,
      })
      .from(registrations)
      .leftJoin(users, eq(registrations.userId, users.id))
      .where(and(...conditions)) as any;

    const registrationList = await query
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset);
  
    // 6. 获取总数（使用同样的条件）
    const [{ count }] = await (db
      .select({
        count: sql<number>`cast(count(*) as integer)`
      })
      .from(registrations)
      .where(and(...conditions)) as any);
  
    return {
      registrations: registrationList,
      pagination: {
        current: page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }
  
  // ====================
//  5. 获取用户报名列表
// ====================
export async function getUserRegistrations(
  userId: number,
  options: {
    status?: RegistrationStatusType;
    page?: number;
    pageSize?: number;
    orderBy?: 'registeredAt' | 'status';
    order?: 'asc' | 'desc';
  } = {}
) {
  const {
    status,
    page = 1,
    pageSize = 20,
    orderBy = 'registeredAt',
    order = 'desc'
  } = options;

  // 1. 构建查询条件
  const conditions = [eq(registrations.userId, userId)];
  if (status !== undefined) {
    conditions.push(eq(registrations.status, status));
  }

  // 2. 构建排序表达式
  const orderByColumn = orderBy === 'registeredAt' ? registrations.registeredAt : registrations.status;
  const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
  const offset = (page - 1) * pageSize;

  // 3. 执行查询
  const registrationList = await db
    .select({
      id: registrations.id,
      userId: registrations.userId,
      activityId: registrations.activityId,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      activityTitle: activities.title,
      activityStartTime: activities.startTime,
      activityEndTime: activities.endTime,
      activityLocation: activities.location,
    })
    .from(registrations)
    .leftJoin(activities, eq(registrations.activityId, activities.id))
    .where(and(...conditions))
    .orderBy(orderExpr)
    .limit(pageSize)
    .offset(offset);

  // 4. 获取总数
  const [{ count }] = await db
    .select({
      count: sql<number>`cast(count(*) as integer)`
    })
    .from(registrations)
    .where(and(...conditions));

  // 5. 处理状态文本
  const registrationsWithStatus = registrationList.map(registration => {
    let statusText: string;
    switch (registration.status) {
      case RegistrationStatus.CANCELLED:
        statusText = 'Cancelled';
        break;
      case RegistrationStatus.PENDING:
        statusText = 'Pending approval';
        break;
      case RegistrationStatus.APPROVED:
        statusText = 'Approved';
        break;
      case RegistrationStatus.REJECTED:
        statusText = 'Rejected';
        break;
      case RegistrationStatus.WAITLIST:
        statusText = 'On waitlist';
        break;
      case RegistrationStatus.ATTENDED:
        statusText = 'Attended';
        break;
      case RegistrationStatus.ABSENT:
        statusText = 'Absent';
        break;
      default:
        statusText = 'Unknown status';
    }
    return {
      ...registration,
      statusText
    };
  });

  return {
    registrations: registrationsWithStatus,
    pagination: {
      current: page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize)
    }
  };
}
  
  // ====================
  //  6. 检查报名人数
  // ====================
  export async function checkRegistrationCapacity(activityId: number): Promise<CapacityInfo> {
    // 1. 获取活动信息
    const [activity] = await db.select({
      id: activities.id,
      capacity: activities.capacity
    })
      .from(activities)
      .where(eq(activities.id, activityId));
  
    if (!activity) {
      throw new Error('Activity not found');
    }
  
    // 2. 获取各状态的报名人数
    const statusCounts = await db.select({
      status: registrations.status,
      count: sql<number>`cast(count(*) as integer)`
    })
      .from(registrations)
      .where(eq(registrations.activityId, activityId))
      .groupBy(registrations.status);
  
    // 3. 统计各状态人数
    const counts = {
      approved: 0,
      pending: 0,
      waitlist: 0
    };
  
    statusCounts.forEach(({ status, count }) => {
      if (status === RegistrationStatus.APPROVED) counts.approved = count;
      if (status === RegistrationStatus.PENDING) counts.pending = count;
      if (status === RegistrationStatus.WAITLIST) counts.waitlist = count;
    });
  
    // 4. 计算可用名额
    const available = activity.capacity > 0 
      ? Math.max(0, activity.capacity - counts.approved)
      : Number.MAX_SAFE_INTEGER;
  
    return {
      activityId,
      capacity: activity.capacity,
      approved: counts.approved,
      pending: counts.pending,
      waitlist: counts.waitlist,
      available,
      isFull: available === 0
    };
  }

// ====================
//  7. 审核报名
// ====================
export async function approveRegistration(registrationId: number) {
  // 1. 获取报名信息
  const [registration] = await db
    .select({
      id: registrations.id,
      activityId: registrations.activityId,
      status: registrations.status
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registration) {
    throw new Error('Registration not found');
  }

  if (registration.status !== RegistrationStatus.PENDING) {
    throw new Error('Registration is not in pending status');
  }

  // 2. 检查活动容量
  const capacityInfo = await checkRegistrationCapacity(registration.activityId);
  
  // 如果活动已满，将状态设为候补
  if (capacityInfo.isFull) {
    const [updatedRegistration] = await db
      .update(registrations)
      .set({
        status: RegistrationStatus.WAITLIST
      })
      .where(eq(registrations.id, registrationId))
      .returning();

    return {
      ...updatedRegistration,
      message: 'Added to waitlist due to full capacity'
    };
  }

  // 3. 批准报名
  const [updatedRegistration] = await db
    .update(registrations)
    .set({
      status: RegistrationStatus.APPROVED,
      // Remove updatedAt since it's not defined in the registration schema
    })
    .where(eq(registrations.id, registrationId))
    .returning();

  return {
    ...updatedRegistration,
    message: 'Registration approved successfully'
  };
}

// ====================
//  8. 拒绝报名
// ====================
export async function rejectRegistration(registrationId: number) {
  // 1. 获取报名信息
  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registration) {
    throw new Error('Registration not found');
  }

  if (registration.status !== RegistrationStatus.PENDING) {
    throw new Error('Registration is not in pending status');
  }

  // 2. 更新状态为拒绝
  const [updatedRegistration] = await db
    .update(registrations)
    .set({
      status: RegistrationStatus.REJECTED,
// Remove updatedAt since it's not defined in the registration schema
    })
    .where(eq(registrations.id, registrationId))
    .returning();

  // 3. 如果有候补，将第一个候补转为待审核
  const [waitlistRegistration] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, registration.activityId),
        eq(registrations.status, RegistrationStatus.WAITLIST)
      )
    )
    .orderBy(registrations.registeredAt)
    .limit(1);

  if (waitlistRegistration) {
    await db
      .update(registrations)
      .set({
        status: RegistrationStatus.PENDING
      })
      .where(eq(registrations.id, waitlistRegistration.id));
  }

  return {
    ...updatedRegistration,
    message: 'Registration rejected successfully'
  };
}

// ====================
//  9. 批量审核
// ====================
// export async function bulkProcessRegistrations(
//   registrationIds: number[],
//   action: 'approve' | 'reject'
// ) {
//   if (!registrationIds.length) {
//     throw new Error('No registration IDs provided');
//   }

//   // 1. 获取所有相关报名
//   const pendingRegistrations = await db
//     .select()
//     .from(registrations)
//     .where(
//       and(
//         dbIn(registrations.id, registrationIds),
//         eq(registrations.status, RegistrationStatus.PENDING)
//       )
//     );

//   if (!pendingRegistrations.length) {
//     throw new Error('No valid pending registrations found');
//   }

//   // 2. 按活动分组，用于检查容量
//   const registrationsByActivity = pendingRegistrations.reduce((acc, reg) => {
//     if (!acc[reg.activityId]) {
//       acc[reg.activityId] = [];
//     }
//     acc[reg.activityId].push(reg);
//     return acc;
//   }, {} as Record<number, typeof pendingRegistrations>);

//   // 3. 处理每个活动的报名
//   const results = [];
//   for (const [activityId, regs] of Object.entries(registrationsByActivity)) {
//     if (action === 'approve') {
//       // 检查活动容量
//       const capacityInfo = await checkRegistrationCapacity(Number(activityId));
//       const availableSpots = capacityInfo.available;

//       // 分配审核结果
//       const toApprove = regs.slice(0, availableSpots);
//       const toWaitlist = regs.slice(availableSpots);

//       // 批准可以容纳的报名
//       if (toApprove.length) {
//         const approved = await db
//           .update(registrations)
//           .set({
//             status: RegistrationStatus.APPROVED
//           })
//           .where(dbIn(registrations.id, toApprove.map(r => r.id)))
//           .returning();
//         results.push(...approved);
//       }

//       // 将剩余的加入候补
//       if (toWaitlist.length) {
//         const waitlisted = await db
//           .update(registrations)
//           .set({
//             status: RegistrationStatus.WAITLIST
//           })
//           .where(dbIn(registrations.id, toWaitlist.map(r => r.id)))
//           .returning();
//         results.push(...waitlisted);
//       }
//     } else {
//       // 拒绝所有报名
//       const rejected = await db
//         .update(registrations)
//         .set({
//           status: RegistrationStatus.REJECTED,
// // Remove updatedAt since it's not defined in the registrations schema
//         })
//         .where(dbIn(registrations.id, regs.map(r => r.id)))
//         .returning();
//       results.push(...rejected);

//       // 处理候补名单
//       for (const reg of regs) {
//         const [waitlistRegistration] = await db
//           .select()
//           .from(registrations)
//           .where(
//             and(
//               eq(registrations.activityId, reg.activityId),
//               eq(registrations.status, RegistrationStatus.WAITLIST)
//             )
//           )
//           .orderBy(registrations.registeredAt)
//           .limit(1);

//         if (waitlistRegistration) {
//           await db
//             .update(registrations)
//             .set({
//               status: RegistrationStatus.PENDING
//             })
//             .where(eq(registrations.id, waitlistRegistration.id));
//         }
//       }
//     }
//   }

//   return {
//     processed: results.length,
//     results,
//     message: `Bulk ${action} completed successfully`
//   };
// }

// ====================
//  10. 报名统计
// ====================
export async function getRegistrationAnalytics(activityId: number) {
  // 1. 获取活动信息
  const [activity] = await db.select({
    id: activities.id,
    title: activities.title,
    capacity: activities.capacity
  })
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取各状态的报名统计
  const statusStats = await db.select({
    status: registrations.status,
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(eq(registrations.activityId, activityId))
    .groupBy(registrations.status);

  // 3. 计算各状态人数
  const stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    waitlist: 0,
    attended: 0,
    absent: 0
  };

  statusStats.forEach(({ status, count }) => {
    stats.total += count;
    switch (status) {
      case RegistrationStatus.APPROVED:
        stats.approved = count;
        break;
      case RegistrationStatus.PENDING:
        stats.pending = count;
        break;
      case RegistrationStatus.REJECTED:
        stats.rejected = count;
        break;
      case RegistrationStatus.CANCELLED:
        stats.cancelled = count;
        break;
      case RegistrationStatus.WAITLIST:
        stats.waitlist = count;
        break;
      case RegistrationStatus.ATTENDED:
        stats.attended = count;
        break;
      case RegistrationStatus.ABSENT:
        stats.absent = count;
        break;
    }
  });

  // 4. 计算比率
  const rates = {
    approvalRate: stats.total > 0 ? (stats.approved / stats.total * 100).toFixed(2) : '0.00',
    attendanceRate: stats.approved > 0 ? (stats.attended / stats.approved * 100).toFixed(2) : '0.00',
    capacityUsage: activity.capacity > 0 ? (stats.approved / activity.capacity * 100).toFixed(2) : '100.00'
  };

  return {
    activityId,
    activityTitle: activity.title,
    capacity: activity.capacity,
    stats,
    rates
  };
}

// ====================
//  11. 参与情况统计
// ====================
export async function getParticipationAnalytics(activityId: number) {
  // 1. 获取活动信息
  const [activity] = await db.select({
    id: activities.id,
    title: activities.title,
    startTime: activities.startTime,
    endTime: activities.endTime
  })
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取参与情况统计
  const participationStats = {
    registered: await getRegistrationCount(activityId),
    attended: await getAttendanceCount(activityId),
    absent: await getAbsentCount(activityId),
    cancelled: await getCancelledCount(activityId)
  };

  // 3. 计算参与率
  const rates = {
    attendanceRate: participationStats.registered > 0
      ? (participationStats.attended / participationStats.registered * 100).toFixed(2)
      : '0.00',
    absentRate: participationStats.registered > 0
      ? (participationStats.absent / participationStats.registered * 100).toFixed(2)
      : '0.00',
    cancellationRate: participationStats.registered > 0
      ? (participationStats.cancelled / participationStats.registered * 100).toFixed(2)
      : '0.00'
  };

  return {
    activityId,
    activityTitle: activity.title,
    startTime: activity.startTime,
    endTime: activity.endTime,
    stats: participationStats,
    rates
  };
}

// 辅助函数：获取总报名人数
async function getRegistrationCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(eq(registrations.activityId, activityId));
  return count;
}

// 辅助函数：获取实际参与人数
async function getAttendanceCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.ATTENDED)
      )
    );
  return count;
}

// 辅助函数：获取缺席人数
async function getAbsentCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.ABSENT)
      )
    );
  return count;
}

// 辅助函数：获取取消报名人数
async function getCancelledCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.CANCELLED)
      )
    );
  return count;
}

// ====================
//  12. 活动状态统计
// ====================
export async function getActivityStatusAnalytics() {
  // 1. 获取所有活动的状态统计
  const activityStats = await db.select({
    status: activities.status,
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(activities)
    .groupBy(activities.status);

  // 2. 统计各状态活动数量
  const stats = {
    total: 0,
    draft: 0,      // 草稿
    published: 0,   // 已发布
    cancelled: 0,   // 已取消
    completed: 0,   // 已结束
    ongoing: 0      // 进行中
  };

  activityStats.forEach(({ status, count }) => {
    stats.total += count;
    switch (status) {
      case 1: // DRAFT
        stats.draft = count;
        break;
      case 2: // PUBLISHED
        stats.published = count;
        break;
      case 3: // CANCELLED
        stats.cancelled = count;
        break;
      case 4: // COMPLETED
        stats.completed = count;
        break;
      case 5: // ONGOING
        stats.ongoing = count;
        break;
    }
  });

  // 3. 计算比率
  const rates = {
    publishRate: stats.total > 0 ? (stats.published / stats.total * 100).toFixed(2) : '0.00',
    cancelRate: stats.total > 0 ? (stats.cancelled / stats.total * 100).toFixed(2) : '0.00',
    completionRate: stats.published > 0 ? (stats.completed / stats.published * 100).toFixed(2) : '0.00'
  };

  return {
    stats,
    rates
  };
}

// 获取活动的已批准报名人数
export async function getApprovedRegistrationCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, 2) // 只统计已批准的
      )
    );
  
  return count;
}

// ====================
//  更新报名状态
// ====================
export async function updateRegistrationStatus(registrationId: number, newStatus: number, operatorId: number) {
  // 1. 检查报名记录是否存在
  const [registration] = await db.select({
    id: registrations.id,
    userId: registrations.userId,
    activityId: registrations.activityId,
    status: registrations.status
  })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registration) {
    throw new Error('报名记录不存在');
  }

  // 2. 检查新状态是否有效
  const validStatuses = [
    RegistrationStatus.CANCELLED,
    RegistrationStatus.PENDING,
    RegistrationStatus.APPROVED,
    RegistrationStatus.REJECTED,
    RegistrationStatus.WAITLIST,
    RegistrationStatus.ATTENDED,
    RegistrationStatus.ABSENT
  ] as number[];

  if (!validStatuses.includes(newStatus)) {
    throw new Error('无效的状态值');
  }

  // 3. 检查操作权限
  // 获取活动信息以验证操作者是否为活动组织者
  const [activity] = await db.select({
    organizerId: activities.organizerId
  })
    .from(activities)
    .where(eq(activities.id, registration.activityId));

  if (!activity) {
    throw new Error('活动不存在');
  }

  // 只有活动组织者或报名者本人可以更新状态
  if (operatorId !== activity.organizerId && operatorId !== registration.userId) {
    const error = new Error('没有权限执行此操作');
    (error as any).status = 403;
    throw error;
  }

  // 4. 更新状态
  const [updatedRegistration] = await db.update(registrations)
    .set({
      status: newStatus
    })
    .where(eq(registrations.id, registrationId))
    .returning();

  return updatedRegistration;
}
