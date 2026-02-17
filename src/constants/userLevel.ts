/** 1 = normal (own pond), 2 = client admin (their business), 3 = super admin (master data, all clients) */
export const UserLevel = {
  Normal: 1,
  ClientAdmin: 2,
  SuperAdmin: 3,
} as const

export type UserLevelValue = (typeof UserLevel)[keyof typeof UserLevel]
