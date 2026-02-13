import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalWarehouses,
      activeWarehouses,
      totalParcels,
      parcelsByStatus,
      totalValue,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),
      // Total warehouses
      this.prisma.warehouse.count(),
      // Active warehouses
      this.prisma.warehouse.count({
        where: { isActive: true },
      }),
      // Total parcels
      this.prisma.parcel.count(),
      // Parcels by status
      this.prisma.parcel.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      // Total inventory value
      this.prisma.parcel.aggregate({
        _sum: {
          retailPrice: true,
        },
        where: {
          status: 'IN_STOCK',
        },
      }),
    ]);

    // Format parcels by status for pie chart
    const parcelStatusDistribution = parcelsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    return {
      users: {
        total: totalUsers,
      },
      warehouses: {
        total: totalWarehouses,
        active: activeWarehouses,
        inactive: totalWarehouses - activeWarehouses,
      },
      parcels: {
        total: totalParcels,
        byStatus: parcelStatusDistribution,
        totalValue: totalValue._sum?.retailPrice || 0,
      },
    };
  }

  async getParcelsTimeline() {
    // Get parcels created in the last 30 days, grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const parcels = await this.prisma.parcel.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date (ignoring time)
    const timelineMap = new Map<string, number>();
    parcels.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      const currentCount = timelineMap.get(date) || 0;
      timelineMap.set(date, currentCount + item._count.id);
    });

    // Convert to array and fill missing dates
    const timeline: Array<{ date: string; count: number }> = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      timeline.push({
        date: dateStr,
        count: timelineMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
  }

  async getWarehousesTimeline() {
    // Get warehouses created in the last 30 days, grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const warehouses = await this.prisma.warehouse.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date (ignoring time)
    const timelineMap = new Map<string, number>();
    warehouses.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      const currentCount = timelineMap.get(date) || 0;
      timelineMap.set(date, currentCount + item._count.id);
    });

    // Convert to array and fill missing dates
    const timeline: Array<{ date: string; count: number }> = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      timeline.push({
        date: dateStr,
        count: timelineMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
  }
}
