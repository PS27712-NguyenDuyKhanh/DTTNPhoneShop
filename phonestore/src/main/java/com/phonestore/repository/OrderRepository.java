package com.phonestore.repository;

import com.phonestore.entity.Order;
import com.phonestore.entity.OrderStatus;
import com.phonestore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);

    long countByStatus(OrderStatus status);

    // 🔥 1. Tổng doanh thu (chỉ tính đã thanh toán)
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.paid = true")
    Long sumRevenue();

    // 🔥 2. Doanh thu theo tháng
    @Query("""
        SELECT MONTH(o.createdAt), SUM(o.total)
        FROM Order o
        WHERE o.paid = true
        GROUP BY MONTH(o.createdAt)
        ORDER BY MONTH(o.createdAt)
    """)
    List<Object[]> revenueByMonth();

    // 🔥 DOANH THU THEO NĂM
    @Query("""
    SELECT YEAR(o.createdAt), SUM(o.total)
    FROM Order o
    WHERE o.paid = true
    GROUP BY YEAR(o.createdAt)
    ORDER BY YEAR(o.createdAt)
""")
    List<Object[]> revenueByYear();

    // 🔥 DOANH THU THEO NGÀY
    @Query("""
    SELECT CAST(o.createdAt AS DATE ), SUM(o.total)
    FROM Order o
    WHERE o.paid = true
    GROUP BY CAST(o.createdAt AS DATE )
    ORDER BY CAST(o.createdAt AS DATE )
""")
    List<Object[]> revenueByDay();

    // 🔥 TOP KHÁCH HÀNG
    @Query("""
    SELECT o.user.username, SUM(o.total)
    FROM Order o
    WHERE o.paid = true
    GROUP BY o.user.username
    ORDER BY SUM(o.total) DESC
""")
    List<Object[]> topCustomers();

    @Query(value = """
    SELECT SUM(total)
    FROM orders
    WHERE CAST(created_at AS DATE) = :date
      AND paid = 1
""", nativeQuery = true)
    Long revenueByExactDay(@Param("date") String date);

    @Query(value = """
    SELECT SUM(total)
    FROM orders
    WHERE MONTH(created_at) = :month
      AND YEAR(created_at) = :year
      AND paid = 1
""", nativeQuery = true)
    Long revenueByMonthYear(@Param("month") int month,
                            @Param("year") int year);

    @Query(value = """
    SELECT SUM(total)
    FROM orders
    WHERE YEAR(created_at) = :year
      AND paid = 1
""", nativeQuery = true)
    Long revenueByYearOnly(@Param("year") int year);

    @Query("""
    SELECT o.user.username, o.user.email, SUM(o.total)
    FROM Order o
    WHERE o.status = :status
    GROUP BY o.user.username, o.user.email
    ORDER BY SUM(o.total) DESC
""")
    List<Object[]> allCustomersRevenue(@Param("status") OrderStatus status);


}