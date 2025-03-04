import { getDashboardStatistics } from '@/models/analytics/get-dashboard-statistics';
import { DashboardClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
	const stats = await getDashboardStatistics();
	return <DashboardClient stats={stats} />;
}
