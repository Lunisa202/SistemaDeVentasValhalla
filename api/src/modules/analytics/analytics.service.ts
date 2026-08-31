import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { roundTo2 } from '../../common/helpers/math';

/**
 * AnalyticsService — read-only aggregated reports for the dashboard.
 *
 * All methods are pure reads (SELECT with GROUP BY / SUM / COUNT).
 * We use raw parameterized SQL because these are analytical queries
 * (aggregations, joins, date grouping) where the ORM adds friction
 * without benefit. Every value is passed via `replacements` to avoid
 * SQL injection.
 *
 * Date handling: `from`/`to` are optional ISO date strings. When absent,
 * each method applies a sensible default range.
 */

interface DateRange {
  from?: string;
  to?: string;
}

/** Resolve a date range to concrete [from, to] with a default window. */
function resolveRange(range: DateRange, defaultDays = 30): { from: string; to: string } {
  const to = range.to ?? new Date().toISOString().slice(0, 10);
  let from = range.from;
  if (!from) {
    const d = new Date(to);
    d.setDate(d.getDate() - defaultDays);
    from = d.toISOString().slice(0, 10);
  }
  return { from, to };
}

export class AnalyticsService {
  /**
   * Overview: headline numbers for today, this week, and this month.
   * Counts sales and sums revenue for each window.
   */
  async getOverview() {
    const rows = await sequelize.query<{
      period: string;
      total_sales: string;
      transaction_count: string;
    }>(
      `SELECT 'today' AS period,
              COALESCE(SUM(total), 0) AS total_sales,
              COUNT(*) AS transaction_count
       FROM sale
       WHERE sold_at >= date_trunc('day', NOW())
       UNION ALL
       SELECT 'week',
              COALESCE(SUM(total), 0),
              COUNT(*)
       FROM sale
       WHERE sold_at >= date_trunc('week', NOW())
       UNION ALL
       SELECT 'month',
              COALESCE(SUM(total), 0),
              COUNT(*)
       FROM sale
       WHERE sold_at >= date_trunc('month', NOW())`,
      { type: QueryTypes.SELECT },
    );

    const byPeriod = (p: string) => {
      const row = rows.find((r) => r.period === p);
      return {
        totalSales: roundTo2(Number(row?.total_sales ?? 0)),
        transactionCount: Number(row?.transaction_count ?? 0),
      };
    };

    return {
      today: byPeriod('today'),
      week: byPeriod('week'),
      month: byPeriod('month'),
    };
  }

  /**
   * Sales grouped by time bucket (day/week/month) within a range.
   * Uses date_trunc to build the time series.
   */
  async getSalesByPeriod(range: DateRange, groupBy: 'day' | 'week' | 'month') {
    const { from, to } = resolveRange(range);

    const rows = await sequelize.query<{
      bucket: string;
      total_sales: string;
      transaction_count: string;
    }>(
      `SELECT date_trunc(:groupBy, sold_at) AS bucket,
              COALESCE(SUM(total), 0) AS total_sales,
              COUNT(*) AS transaction_count
       FROM sale
       WHERE sold_at >= :from::date AND sold_at < (:to::date + INTERVAL '1 day')
       GROUP BY bucket
       ORDER BY bucket ASC`,
      { replacements: { groupBy, from, to }, type: QueryTypes.SELECT },
    );

    return {
      range: { from, to },
      groupBy,
      series: rows.map((r) => ({
        bucket: r.bucket,
        totalSales: roundTo2(Number(r.total_sales)),
        transactionCount: Number(r.transaction_count),
      })),
    };
  }

  /**
   * Top-selling products by quantity within a range.
   * Joins sale_detail → sale (for date filter) → product (for name).
   */
  async getTopProducts(range: DateRange, limit: number) {
    const { from, to } = resolveRange(range);

    const rows = await sequelize.query<{
      product_id: string;
      name: string;
      code: string;
      units_sold: string;
      revenue: string;
    }>(
      `SELECT p.id AS product_id,
              p.name,
              p.code,
              COALESCE(SUM(sd.quantity), 0) AS units_sold,
              COALESCE(SUM(sd.subtotal), 0) AS revenue
       FROM sale_detail sd
       JOIN sale s ON s.id = sd.sale_id
       JOIN product p ON p.id = sd.product_id
       WHERE s.sold_at >= :from::date AND s.sold_at < (:to::date + INTERVAL '1 day')
       GROUP BY p.id, p.name, p.code
       ORDER BY units_sold DESC
       LIMIT :limit`,
      { replacements: { from, to, limit }, type: QueryTypes.SELECT },
    );

    return {
      range: { from, to },
      products: rows.map((r) => ({
        productId: r.product_id,
        name: r.name,
        code: r.code,
        unitsSold: Number(r.units_sold),
        revenue: roundTo2(Number(r.revenue)),
      })),
    };
  }

  /**
   * Sales broken down by payment method within a range.
   */
  async getSalesByPaymentMethod(range: DateRange) {
    const { from, to } = resolveRange(range);

    const rows = await sequelize.query<{
      payment_method_id: number;
      name: string;
      display_name: string;
      total_sales: string;
      transaction_count: string;
    }>(
      `SELECT pm.id AS payment_method_id,
              pm.name,
              pm.display_name,
              COALESCE(SUM(s.total), 0) AS total_sales,
              COUNT(s.id) AS transaction_count
       FROM payment_method pm
       LEFT JOIN sale s
         ON s.payment_method_id = pm.id
         AND s.sold_at >= :from::date AND s.sold_at < (:to::date + INTERVAL '1 day')
       GROUP BY pm.id, pm.name, pm.display_name
       ORDER BY total_sales DESC`,
      { replacements: { from, to }, type: QueryTypes.SELECT },
    );

    return {
      range: { from, to },
      methods: rows.map((r) => ({
        paymentMethodId: r.payment_method_id,
        name: r.name,
        displayName: r.display_name,
        totalSales: roundTo2(Number(r.total_sales)),
        transactionCount: Number(r.transaction_count),
      })),
    };
  }

  /**
   * Sales broken down by product category within a range.
   */
  async getSalesByCategory(range: DateRange) {
    const { from, to } = resolveRange(range);

    const rows = await sequelize.query<{
      category_id: number;
      name: string;
      units_sold: string;
      revenue: string;
    }>(
      `SELECT c.id AS category_id,
              c.name,
              COALESCE(SUM(sd.quantity), 0) AS units_sold,
              COALESCE(SUM(sd.subtotal), 0) AS revenue
       FROM product_category c
       LEFT JOIN product p ON p.category_id = c.id
       LEFT JOIN sale_detail sd ON sd.product_id = p.id
       LEFT JOIN sale s ON s.id = sd.sale_id
         AND s.sold_at >= :from::date AND s.sold_at < (:to::date + INTERVAL '1 day')
       GROUP BY c.id, c.name
       ORDER BY revenue DESC NULLS LAST`,
      { replacements: { from, to }, type: QueryTypes.SELECT },
    );

    return {
      range: { from, to },
      categories: rows.map((r) => ({
        categoryId: r.category_id,
        name: r.name,
        unitsSold: Number(r.units_sold),
        revenue: roundTo2(Number(r.revenue)),
      })),
    };
  }

  /**
   * Profit/Loss (cash-flow style): revenue from sales vs spend on purchases
   * within a range. Note: this compares money IN (sales) vs money OUT
   * (purchases), NOT per-product margin (which would require weighted
   * average cost — see docs). Useful for a period cash-flow view.
   */
  async getProfitLoss(range: DateRange) {
    const { from, to } = resolveRange(range);

    const [sales] = await sequelize.query<{ total: string }>(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM sale
       WHERE sold_at >= :from::date AND sold_at < (:to::date + INTERVAL '1 day')`,
      { replacements: { from, to }, type: QueryTypes.SELECT },
    );

    const [purchases] = await sequelize.query<{ total: string }>(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM purchase
       WHERE purchased_at >= :from::date AND purchased_at < (:to::date + INTERVAL '1 day')`,
      { replacements: { from, to }, type: QueryTypes.SELECT },
    );

    const salesTotal = roundTo2(Number(sales?.total ?? 0));
    const purchasesTotal = roundTo2(Number(purchases?.total ?? 0));
    const balance = roundTo2(salesTotal - purchasesTotal);

    return {
      range: { from, to },
      salesTotal,
      purchasesTotal,
      balance,
    };
  }

  /**
   * Products at or below a stock threshold (active only).
   * Helps trigger restock decisions.
   */
  async getLowStock(threshold: number) {
    const rows = await sequelize.query<{
      id: string;
      name: string;
      code: string;
      stock: number;
      category_name: string;
    }>(
      `SELECT p.id, p.name, p.code, p.stock, c.name AS category_name
       FROM product p
       JOIN product_category c ON c.id = p.category_id
       WHERE p.is_active = TRUE AND p.stock <= :threshold
       ORDER BY p.stock ASC`,
      { replacements: { threshold }, type: QueryTypes.SELECT },
    );

    return {
      threshold,
      products: rows.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        stock: Number(r.stock),
        categoryName: r.category_name,
      })),
    };
  }

  /**
   * Seller performance: sales count and revenue per seller within a range.
   */
  async getSalesBySeller(range: DateRange) {
    const { from, to } = resolveRange(range);

    const rows = await sequelize.query<{
      seller_id: string;
      first_name: string;
      last_name: string;
      total_sales: string;
      transaction_count: string;
    }>(
      `SELECT u.id AS seller_id,
              u.first_name,
              u.last_name,
              COALESCE(SUM(s.total), 0) AS total_sales,
              COUNT(s.id) AS transaction_count
       FROM "user" u
       JOIN sale s ON s.seller_id = u.id
         AND s.sold_at >= :from::date AND s.sold_at < (:to::date + INTERVAL '1 day')
       GROUP BY u.id, u.first_name, u.last_name
       ORDER BY total_sales DESC`,
      { replacements: { from, to }, type: QueryTypes.SELECT },
    );

    return {
      range: { from, to },
      sellers: rows.map((r) => ({
        sellerId: r.seller_id,
        firstName: r.first_name,
        lastName: r.last_name,
        totalSales: roundTo2(Number(r.total_sales)),
        transactionCount: Number(r.transaction_count),
      })),
    };
  }
}
