import { prototypeStore } from '../c-prototype/storage';
export type Source = {
  id: string;
  channelCode: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};
export type Level = {
  id: string;
  name: string;
  growth: number;
  points: number;
  expireDays: number;
  enabled: boolean;
};
export type Expiry = {
  id: string;
  name: string;
  days: number;
  defaultDays: number;
};
export type Support = { sources: Source[]; levels: Level[]; expiry: Expiry[] };
export const userSupportKey = 'bp-user-support-management-v1';
export const seedUserSupport = (): Support => ({
  sources: [
    {
      id: 'RS-DEMO-1',
      channelCode: 'website',
      name: '站内注册',
      order: 10,
      createdAt: '2026-10-05 10:00:00',
      updatedAt: '2026-10-05 10:00:00',
    },
    {
      id: 'RS-DEMO-2',
      channelCode: 'creator',
      name: '创作者合作',
      order: 20,
      createdAt: '2026-10-05 10:00:00',
      updatedAt: '2026-10-05 10:00:00',
    },
  ],
  levels: [1, 2, 3].map((n) => ({
    id: 'VIP-DEMO-' + n,
    name: 'vip' + n,
    growth: n * 1000,
    points: n * 10,
    expireDays: 30,
    enabled: true,
  })),
  expiry: [
    ['sign_in', '签到'],
    ['invite', '邀请'],
    ['recharge', '充值'],
    ['recharge_commission', '充值佣金'],
    ['activity', '活动'],
  ].map(([id, name]) => ({ id, name, days: 30, defaultDays: 30 })),
});
export function readUserSupport(): Support {
  try {
    const raw = prototypeStore.getItem(userSupportKey);
    return raw
      ? { ...seedUserSupport(), ...JSON.parse(raw) }
      : seedUserSupport();
  } catch {
    return seedUserSupport();
  }
}
